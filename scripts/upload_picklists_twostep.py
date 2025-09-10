#!/usr/bin/env python3
"""
Upload Liferay picklists via REST API using two-step approach
"""
import os
import json
import requests
from requests.auth import HTTPBasicAuth
import sys
import time

# API endpoints
API_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud/o/headless-admin-list-type/v1.0/list-type-definitions"

# Get credentials from environment
USERNAME = os.getenv('LIFERAY_USERNAME')
PASSWORD = os.getenv('LIFERAY_PASSWORD')

REMAINING_PICKLISTS = {
    'DEAL_STATUS': 'picklists/DEAL_STATUS.json',
    'ACTIVITY_TYPE': 'picklists/ACTIVITY_TYPE.json', 
    'ACTIVITY_STATUS': 'picklists/ACTIVITY_STATUS.json',
    'LOAN_STATUS': 'picklists/LOAN_STATUS.json'
}

def normalize_key(key):
    """Convert to pure alphanumeric keys"""
    import re
    # Remove all non-alphanumeric characters and convert to lowercase
    clean_key = re.sub(r'[^a-zA-Z0-9]', '', key).lower()
    return clean_key

def create_picklist_definition(external_ref_code, name, name_i18n):
    """Step 1: Create empty picklist definition"""
    definition_data = {
        "defaultLanguageId": "en-US",
        "externalReferenceCode": external_ref_code,
        "name": name,
        "name_i18n": name_i18n,
        "system": False
    }
    
    try:
        response = requests.post(
            API_URL,
            json=definition_data,
            auth=HTTPBasicAuth(USERNAME, PASSWORD),
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            definition_id = result.get('id')
            print(f"✅ Created definition {external_ref_code} (ID: {definition_id})")
            return definition_id
        else:
            print(f"❌ Failed to create definition {external_ref_code}")
            print(f"   Status: {response.status_code}, Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating definition {external_ref_code}: {e}")
        return None

def add_picklist_entry(definition_id, entry_data, picklist_name):
    """Step 2: Add individual entry to picklist"""
    # Remove type field and normalize key
    clean_entry = {
        "key": normalize_key(entry_data["key"]),
        "name": entry_data["name"],
        "name_i18n": entry_data["name_i18n"],
        "externalReferenceCode": entry_data["externalReferenceCode"]
    }
    
    entry_url = f"{API_URL}/{definition_id}/list-type-entries"
    
    try:
        response = requests.post(
            entry_url,
            json=clean_entry,
            auth=HTTPBasicAuth(USERNAME, PASSWORD),
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            print(f"   ✅ Added entry: {clean_entry['name']}")
            return True
        else:
            print(f"   ❌ Failed to add entry: {clean_entry['name']}")
            print(f"      Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error adding entry {clean_entry['name']}: {e}")
        return False

def upload_picklist_twostep(external_ref_code, file_path):
    """Upload picklist using two-step approach"""
    print(f"\n📋 Uploading {external_ref_code} (two-step approach)...")
    
    try:
        # Read picklist file
        with open(file_path, 'r', encoding='utf-8') as f:
            picklist_data = json.load(f)
        
        # Step 1: Create definition
        definition_id = create_picklist_definition(
            external_ref_code,
            picklist_data["name"],
            picklist_data["name_i18n"]
        )
        
        if not definition_id:
            return False
        
        # Small delay
        time.sleep(0.5)
        
        # Step 2: Add entries one by one
        entries = picklist_data["listTypeEntries"]
        success_count = 0
        
        for entry in entries:
            if add_picklist_entry(definition_id, entry, external_ref_code):
                success_count += 1
            time.sleep(0.2)  # Small delay between entries
        
        print(f"   📊 {success_count}/{len(entries)} entries added successfully")
        return success_count == len(entries)
        
    except Exception as e:
        print(f"❌ Error processing {external_ref_code}: {e}")
        return False

def main():
    """Upload remaining picklists using two-step approach"""
    print("🚀 Uploading picklists (two-step approach)...")
    print(f"📡 API Endpoint: {API_URL}")
    print(f"👤 Username: {USERNAME}")
    
    success_count = 0
    total_count = len(REMAINING_PICKLISTS)
    
    for external_ref_code, file_path in REMAINING_PICKLISTS.items():
        if upload_picklist_twostep(external_ref_code, file_path):
            success_count += 1
    
    print(f"\n📊 Final Summary:")
    print(f"   ✅ Successful: {success_count}/{total_count}")
    print(f"   ❌ Failed: {total_count - success_count}/{total_count}")
    
    if success_count == total_count:
        print("\n🎉 All remaining picklists uploaded successfully!")
        return 0
    else:
        print(f"\n⚠️  Some uploads failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())