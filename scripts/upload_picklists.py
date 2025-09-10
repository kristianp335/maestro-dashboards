#!/usr/bin/env python3
"""
Upload Liferay picklists via REST API
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

if not USERNAME or not PASSWORD:
    print("ERROR: Missing LIFERAY_USERNAME or LIFERAY_PASSWORD environment variables")
    sys.exit(1)

# Picklist file mappings
PICKLISTS = {
    'CLIENT_STATUS': 'picklists/CLIENT_STATUS.json',
    'DEAL_STATUS': 'picklists/DEAL_STATUS.json', 
    'DEAL_PRIORITY': 'picklists/DEAL_PRIORITY.json',
    'ACTIVITY_TYPE': 'picklists/ACTIVITY_TYPE.json',
    'ACTIVITY_STATUS': 'picklists/ACTIVITY_STATUS.json',
    'LOAN_STATUS': 'picklists/LOAN_STATUS.json'
}

def transform_picklist_for_api(picklist_data, external_ref_code):
    """Transform picklist JSON to match API format"""
    api_data = {
        "defaultLanguageId": "en-US",
        "externalReferenceCode": external_ref_code,
        "name": picklist_data["name"],
        "name_i18n": picklist_data["name_i18n"],
        "system": False,  # Keep as False, not True as in example
        "listTypeEntries": picklist_data["listTypeEntries"]
    }
    return api_data

def upload_picklist(external_ref_code, file_path):
    """Upload a single picklist to Liferay"""
    print(f"\n📋 Uploading {external_ref_code}...")
    
    try:
        # Read picklist file
        with open(file_path, 'r', encoding='utf-8') as f:
            picklist_data = json.load(f)
        
        # Transform to API format
        api_data = transform_picklist_for_api(picklist_data, external_ref_code)
        
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
        else:
            print(f"❌ Failed to upload {external_ref_code}")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {file_path}: {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error uploading {external_ref_code}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error uploading {external_ref_code}: {e}")
        return False

def main():
    """Upload all picklists"""
    print("🚀 Starting picklist upload to Liferay...")
    print(f"📡 API Endpoint: {API_URL}")
    print(f"👤 Username: {USERNAME}")
    
    success_count = 0
    total_count = len(PICKLISTS)
    
    for external_ref_code, file_path in PICKLISTS.items():
        if upload_picklist(external_ref_code, file_path):
            success_count += 1
    
    print(f"\n📊 Upload Summary:")
    print(f"   ✅ Successful: {success_count}/{total_count}")
    print(f"   ❌ Failed: {total_count - success_count}/{total_count}")
    
    if success_count == total_count:
        print("\n🎉 All picklists uploaded successfully!")
        return 0
    else:
        print(f"\n⚠️  Some uploads failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())