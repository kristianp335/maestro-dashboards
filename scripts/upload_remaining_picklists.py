#!/usr/bin/env python3
"""
Upload remaining Liferay picklists via REST API (skip existing ones)
"""
import os
import json
import requests
from requests.auth import HTTPBasicAuth
import sys

# API endpoint
API_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud/o/headless-admin-list-type/v1.0/list-type-definitions"

# Get credentials from environment
USERNAME = os.getenv('LIFERAY_USERNAME')
PASSWORD = os.getenv('LIFERAY_PASSWORD')

# Only upload these (the ones we know don't exist yet)
REMAINING_PICKLISTS = {
    'DEAL_STATUS': 'picklists/DEAL_STATUS.json',
    'ACTIVITY_TYPE': 'picklists/ACTIVITY_TYPE.json', 
    'ACTIVITY_STATUS': 'picklists/ACTIVITY_STATUS.json',
    'LOAN_STATUS': 'picklists/LOAN_STATUS.json'
}

def get_existing_picklists():
    """Get list of existing picklist external reference codes"""
    try:
        response = requests.get(
            API_URL,
            auth=HTTPBasicAuth(USERNAME, PASSWORD),
            headers={'Accept': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'items' in data:
                return {item.get('externalReferenceCode') for item in data['items']}
        return set()
    except:
        return set()

def transform_picklist_for_api(picklist_data, external_ref_code):
    """Transform picklist JSON to match API format"""
    api_data = {
        "defaultLanguageId": "en-US",
        "externalReferenceCode": external_ref_code,
        "name": picklist_data["name"],
        "name_i18n": picklist_data["name_i18n"],
        "system": False,
        "listTypeEntries": picklist_data["listTypeEntries"]
    }
    return api_data

def upload_picklist(external_ref_code, file_path, debug=True):
    """Upload a single picklist to Liferay with detailed debugging"""
    print(f"\n📋 Uploading {external_ref_code}...")
    
    try:
        # Read picklist file
        with open(file_path, 'r', encoding='utf-8') as f:
            picklist_data = json.load(f)
        
        # Transform to API format
        api_data = transform_picklist_for_api(picklist_data, external_ref_code)
        
        if debug:
            print(f"   📤 Payload preview: {external_ref_code} with {len(api_data['listTypeEntries'])} entries")
        
        # Make API request
        response = requests.post(
            API_URL,
            json=api_data,
            auth=HTTPBasicAuth(USERNAME, PASSWORD),
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Successfully uploaded {external_ref_code}")
            return True
        elif response.status_code == 400:
            print(f"⚠️  {external_ref_code} may already exist (400 error)")
            print(f"   Response: {response.text}")
            return False
        else:
            print(f"❌ Failed to upload {external_ref_code}")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if debug and response.status_code == 500:
                print(f"   📝 Debug - Request payload:")
                print(f"   {json.dumps(api_data, indent=2)[:500]}...")
            
            return False
            
    except Exception as e:
        print(f"❌ Error uploading {external_ref_code}: {e}")
        return False

def main():
    """Upload remaining picklists"""
    print("🚀 Uploading remaining picklists to Liferay...")
    print(f"📡 API Endpoint: {API_URL}")
    print(f"👤 Username: {USERNAME}")
    
    # Check existing picklists
    print("\n🔍 Checking existing picklists...")
    existing = get_existing_picklists()
    print(f"   Found {len(existing)} existing picklists")
    
    success_count = 0
    skipped_count = 0
    total_count = len(REMAINING_PICKLISTS)
    
    for external_ref_code, file_path in REMAINING_PICKLISTS.items():
        if external_ref_code in existing:
            print(f"\n⏭️  Skipping {external_ref_code} (already exists)")
            skipped_count += 1
        else:
            if upload_picklist(external_ref_code, file_path):
                success_count += 1
    
    print(f"\n📊 Upload Summary:")
    print(f"   ✅ Successful: {success_count}/{total_count}")
    print(f"   ⏭️  Skipped: {skipped_count}/{total_count}")
    print(f"   ❌ Failed: {total_count - success_count - skipped_count}/{total_count}")
    
    if success_count + skipped_count == total_count:
        print("\n🎉 All picklists are now available!")
        return 0
    else:
        print(f"\n⚠️  Some uploads failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())