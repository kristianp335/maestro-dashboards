#!/usr/bin/env python3

import requests
import json
import os
import sys
import base64
import time
from datetime import datetime

# Boots Opticians API Configuration
BOOTS_URL = "https://webserver-lctbootsopticians-prd.lfr.cloud"
BOOTS_USERNAME = "nick@boots.com"
BOOTS_PASSWORD = "Gloria1234!"

def get_boots_auth_header():
    """Create Basic Auth header for Boots Opticians instance"""
    credentials = f"{BOOTS_USERNAME}:{BOOTS_PASSWORD}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def create_maestro_folder():
    """Create Maestro folder structure on Boots instance"""
    print("🏗️ Creating Maestro folder structure...")
    
    folder_data = {
        "name": "Maestro GFD Objects",
        "externalReferenceCode": "MAESTRO_FOLDER_ERC"
    }
    
    url = f"{BOOTS_URL}/o/object-admin/v1.0/object-folders"
    headers = {
        "Authorization": get_boots_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=folder_data, headers=headers, timeout=30)
        
        if response.status_code in [200, 201]:
            folder = response.json()
            folder_id = folder.get('id')
            print(f"✅ Maestro folder created: {folder_id}")
            return folder_id
        else:
            print(f"❌ Failed to create folder: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception creating folder: {str(e)}")
        return None

def create_picklist(name, external_ref_code, items):
    """Create a picklist on Boots instance"""
    print(f"📋 Creating picklist: {name}")
    
    picklist_data = {
        "name": name,
        "externalReferenceCode": external_ref_code,
        "listTypeEntries": [
            {
                "key": item["key"],
                "name": item["name"],
                "externalReferenceCode": item.get("externalReferenceCode", f"{external_ref_code}_{item['key']}")
            }
            for item in items
        ]
    }
    
    url = f"{BOOTS_URL}/o/headless-admin-list-type/v1.0/list-type-definitions"
    headers = {
        "Authorization": get_boots_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=picklist_data, headers=headers, timeout=30)
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Picklist created: {result.get('id')}")
            return True
        else:
            print(f"❌ Failed to create picklist: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception creating picklist: {str(e)}")
        return False

def create_all_picklists():
    """Create all required picklists"""
    print("📋 Creating all picklists...")
    
    picklists = [
        {
            "name": "Deal Status",
            "external_ref_code": "DEAL_STATUS",
            "items": [
                {"key": "qualified", "name": "Qualified"},
                {"key": "proposal", "name": "Proposal Sent"},
                {"key": "closedwon", "name": "Closed Won"},
                {"key": "closedlost", "name": "Closed Lost"},
                {"key": "negotiation", "name": "In Negotiation"},
                {"key": "prospect", "name": "Prospect"}
            ]
        },
        {
            "name": "Loan Status", 
            "external_ref_code": "LOAN_STATUS",
            "items": [
                {"key": "active", "name": "Active"},
                {"key": "pending", "name": "Pending Approval"},
                {"key": "approved", "name": "Approved"},
                {"key": "rejected", "name": "Rejected"},
                {"key": "completed", "name": "Completed"},
                {"key": "defaulted", "name": "Defaulted"}
            ]
        },
        {
            "name": "Risk Rating",
            "external_ref_code": "RISK_RATING", 
            "items": [
                {"key": "low", "name": "Low Risk"},
                {"key": "medium", "name": "Medium Risk"},
                {"key": "high", "name": "High Risk"},
                {"key": "critical", "name": "Critical Risk"}
            ]
        },
        {
            "name": "Activity Status",
            "external_ref_code": "ACTIVITY_STATUS",
            "items": [
                {"key": "pending", "name": "Pending"},
                {"key": "inprogress", "name": "In Progress"},
                {"key": "completed", "name": "Completed"},
                {"key": "onhold", "name": "On Hold"},
                {"key": "cancelled", "name": "Cancelled"}
            ]
        },
        {
            "name": "Currency",
            "external_ref_code": "CURRENCY",
            "items": [
                {"key": "EUR", "name": "Euro (EUR)"},
                {"key": "USD", "name": "US Dollar (USD)"},
                {"key": "GBP", "name": "British Pound (GBP)"},
                {"key": "CHF", "name": "Swiss Franc (CHF)"},
                {"key": "JPY", "name": "Japanese Yen (JPY)"}
            ]
        },
        {
            "name": "Deal Priority",
            "external_ref_code": "DEAL_PRIORITY", 
            "items": [
                {"key": "low", "name": "Low Priority"},
                {"key": "medium", "name": "Medium Priority"},
                {"key": "high", "name": "High Priority"},
                {"key": "urgent", "name": "Urgent"}
            ]
        }
    ]
    
    success_count = 0
    for picklist in picklists:
        if create_picklist(picklist["name"], picklist["external_ref_code"], picklist["items"]):
            success_count += 1
        time.sleep(2)  # Brief pause between requests
    
    print(f"📋 Created {success_count}/{len(picklists)} picklists")
    return success_count == len(picklists)

if __name__ == "__main__":
    print("🚀 Starting Maestro migration to Boots Opticians...")
    
    # Step 1: Create folder
    folder_id = create_maestro_folder()
    if not folder_id:
        sys.exit(1)
    
    # Step 2: Create picklists  
    if not create_all_picklists():
        print("❌ Failed to create all picklists")
        sys.exit(1)
        
    print("✅ Folder and picklists created successfully!")