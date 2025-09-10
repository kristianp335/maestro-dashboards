#!/usr/bin/env python3
"""
Check existing Liferay picklists via REST API
"""
import os
import requests
from requests.auth import HTTPBasicAuth
import json

# API endpoint
API_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud/o/headless-admin-list-type/v1.0/list-type-definitions"

# Get credentials from environment
USERNAME = os.getenv('LIFERAY_USERNAME')
PASSWORD = os.getenv('LIFERAY_PASSWORD')

def check_existing_picklists():
    """Check what picklists already exist"""
    print("🔍 Checking existing picklists...")
    
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
                print(f"\n📋 Found {len(data['items'])} existing picklists:")
                for item in data['items']:
                    erc = item.get('externalReferenceCode', 'N/A')
                    name = item.get('name', 'N/A')
                    print(f"   • {erc} - {name}")
                return data['items']
            else:
                print("   No picklists found")
                return []
        else:
            print(f"❌ Failed to fetch picklists: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error fetching picklists: {e}")
        return None

if __name__ == "__main__":
    check_existing_picklists()