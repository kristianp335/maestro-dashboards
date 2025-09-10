#!/usr/bin/env python3
"""
Fixed upload script with correct field mappings for Liferay Objects
Addresses the blank fields issue by ensuring proper status values and field formats
"""

import json
import requests
import base64
import os
import time
from datetime import datetime

# Liferay API configuration  
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_client_data_fixed(client):
    """Transform client data with CORRECT picklist mappings"""
    # Fix status mapping to match exact picklist values
    status_mapping = {
        "active": "Active",      # Must match picklist exactly
        "prospect": "Prospect", 
        "inactive": "Inactive",
        "suspended": "Suspended"
    }
    
    return {
        "externalReferenceCode": client["clientId"],
        "clientId": client["clientId"],
        "clientName": client["clientName"],
        "legalEntityType": client["legalEntityType"],
        "country": client["country"],
        "sector": client["sector"],
        "creditRating": client["creditRating"],
        "annualRevenue": client["annualRevenue"],
        "relationshipStartDate": client["relationshipStartDate"],
        "relationshipManager": client["relationshipManager"],
        "clientStatus": status_mapping.get(client["clientStatus"], "Active"),  # Fixed mapping
        "riskClassification": client["riskClassification"],
        "clientNotes": client["clientNotes"]
    }

def upload_single_test_client():
    """Upload one test client with correct mappings to verify it works"""
    
    # Load first client from our data
    with open("expanded_data/expanded-clients.json", "r") as f:
        data = json.load(f)
    
    test_client = data["items"][0]  # Get first client
    
    # Transform with fixed mappings
    transformed = transform_client_data_fixed(test_client)
    
    print("🔧 Testing fixed client upload...")
    print(f"Original status: {test_client['clientStatus']}")
    print(f"Fixed status: {transformed['clientStatus']}")
    print("-" * 50)
    
    url = LIFERAY_BASE_URL + "/o/c/maestroclients/"
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Upload
    response = requests.post(url, json=transformed, headers=headers)
    print(f"Upload Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        created_id = result.get('id')
        print(f"✅ Client created with ID: {created_id}")
        
        # Fetch back to see what was saved
        get_response = requests.get(f"{url}{created_id}", headers=headers)
        if get_response.status_code == 200:
            saved_data = get_response.json()
            print("\n📋 Saved data check:")
            print(f"External Reference: {saved_data.get('externalReferenceCode')}")
            print(f"Status: {saved_data.get('status', {}).get('label', 'N/A')}")
            
            # Check if custom fields are in the response
            custom_fields = ['clientId', 'clientName', 'country', 'sector']
            for field in custom_fields:
                value = saved_data.get(field, 'MISSING')
                print(f"{field}: {value}")
            
            if any(saved_data.get(field) for field in custom_fields):
                print("🎉 SUCCESS: Custom fields are being saved!")
                return True
            else:
                print("❌ ISSUE: Custom fields still not appearing in API response")
                return False
    else:
        print(f"❌ Upload failed: {response.text}")
        return False

def check_object_configuration():
    """Check if the Maestro Client object is properly configured"""
    print("\n🔍 Checking object configuration...")
    
    # Get object definition
    url = f"{LIFERAY_BASE_URL}/o/object-admin/v1.0/object-definitions"
    headers = {
        "Authorization": get_auth_header(),
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        objects = response.json().get('items', [])
        maestro_client = None
        
        for obj in objects:
            if 'maestroclients' in obj.get('restContextPath', '').lower():
                maestro_client = obj
                break
        
        if maestro_client:
            print(f"✅ Found object: {maestro_client['name']}")
            print(f"Status: {maestro_client.get('status', {}).get('label', 'Unknown')}")
            print(f"Active: {maestro_client.get('active', 'Unknown')}")
            print(f"REST Path: {maestro_client.get('restContextPath')}")
            
            # Check if it's published/active
            if not maestro_client.get('active', False):
                print("⚠️  ISSUE: Object is not active - this may cause field visibility issues")
                return False
            else:
                print("✅ Object is active")
                return True
        else:
            print("❌ Could not find maestroclients object")
            return False
    else:
        print(f"❌ Failed to get object definitions: {response.status_code}")
        return False

def main():
    """Test the fixed upload process"""
    print("🚀 Diagnosing and fixing the blank fields issue...")
    print("=" * 60)
    
    # Step 1: Check object configuration
    config_ok = check_object_configuration()
    
    # Step 2: Test upload with fixed mappings
    upload_ok = upload_single_test_client()
    
    print("\n" + "=" * 60)
    print("📊 DIAGNOSIS SUMMARY:")
    print(f"Object Configuration: {'✅ OK' if config_ok else '❌ ISSUE'}")
    print(f"Upload with Fixed Mappings: {'✅ OK' if upload_ok else '❌ ISSUE'}")
    
    if not upload_ok:
        print("\n🔧 RECOMMENDED ACTIONS:")
        print("1. Object may need to be re-published in Liferay Admin")
        print("2. Fields may need specific REST API permissions")
        print("3. Object definition may need to be re-uploaded")

if __name__ == "__main__":
    main()