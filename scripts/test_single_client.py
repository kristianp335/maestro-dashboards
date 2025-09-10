#!/usr/bin/env python3
"""
Test uploading a single client with debug information to identify field mapping issues
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
ENDPOINT = "/o/c/maestroclients/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def test_client_upload():
    """Test uploading a single client with various field formats"""
    
    # Test different data formats
    test_clients = [
        {
            "name": "Simple Format",
            "data": {
                "externalReferenceCode": "TEST-CLIENT-001",
                "clientId": "TEST-CLIENT-001",
                "clientName": "Test Company Ltd",
                "legalEntityType": "Private Limited Company",
                "country": "France",
                "sector": "Technology"
            }
        },
        {
            "name": "With Status Active",
            "data": {
                "externalReferenceCode": "TEST-CLIENT-002", 
                "clientId": "TEST-CLIENT-002",
                "clientName": "Test Company 2 Ltd",
                "legalEntityType": "Public Limited Company",
                "country": "Germany", 
                "sector": "Healthcare",
                "clientStatus": "Active"
            }
        },
        {
            "name": "Full Data",
            "data": {
                "externalReferenceCode": "TEST-CLIENT-003",
                "clientId": "TEST-CLIENT-003",
                "clientName": "Test Company 3 Ltd",
                "legalEntityType": "Private Limited Company",
                "country": "France",
                "sector": "Energy",
                "creditRating": "A",
                "annualRevenue": 50000000.0,
                "relationshipStartDate": "2024-01-15",
                "relationshipManager": "Test Manager",
                "clientStatus": "Active",
                "riskClassification": "Low",
                "clientNotes": "Test client for debugging field mapping issues"
            }
        }
    ]
    
    url = LIFERAY_BASE_URL + ENDPOINT
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print("🔍 Testing client uploads to identify field mapping issues...")
    print(f"Target: {url}")
    print("-" * 60)
    
    for test in test_clients:
        print(f"\n📋 Testing: {test['name']}")
        print(f"Payload: {json.dumps(test['data'], indent=2)}")
        
        try:
            response = requests.post(url, json=test['data'], headers=headers)
            print(f"Status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                print("✅ Success!")
                response_data = response.json()
                created_id = response_data.get('id')
                print(f"Created ID: {created_id}")
                
                # Fetch the created record to see what was actually saved
                if created_id:
                    get_response = requests.get(f"{url}{created_id}", headers=headers)
                    if get_response.status_code == 200:
                        saved_data = get_response.json()
                        print("Saved data:")
                        print(json.dumps(saved_data, indent=2))
                    
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
        
        print("-" * 40)

if __name__ == "__main__":
    test_client_upload()