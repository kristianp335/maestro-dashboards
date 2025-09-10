#!/usr/bin/env python3
"""
Retry failed picklist entries with pure alphanumeric keys
"""
import os
import requests
from requests.auth import HTTPBasicAuth
import re
import time

# API endpoints
API_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud/o/headless-admin-list-type/v1.0/list-type-definitions"

# Get credentials from environment
USERNAME = os.getenv('LIFERAY_USERNAME')
PASSWORD = os.getenv('LIFERAY_PASSWORD')

# Known failed entries with their definition IDs
FAILED_ENTRIES = {
    195530: [  # DEAL_STATUS
        {"name": "Closed Won", "name_i18n": {"en-US": "Closed Won"}, "externalReferenceCode": "DEAL_STATUS_CLOSED_WON", "key": "closed_won"},
        {"name": "Closed Lost", "name_i18n": {"en-US": "Closed Lost"}, "externalReferenceCode": "DEAL_STATUS_CLOSED_LOST", "key": "closed_lost"}
    ],
    195535: [  # ACTIVITY_TYPE - ALL entries failed
        {"name": "Client Meeting", "name_i18n": {"en-US": "Client Meeting"}, "externalReferenceCode": "ACTIVITY_TYPE_CLIENT_MEETING", "key": "client_meeting"},
        {"name": "Phone Call", "name_i18n": {"en-US": "Phone Call"}, "externalReferenceCode": "ACTIVITY_TYPE_PHONE_CALL", "key": "phone_call"},
        {"name": "Document Review", "name_i18n": {"en-US": "Document Review"}, "externalReferenceCode": "ACTIVITY_TYPE_DOCUMENT_REVIEW", "key": "document_review"},
        {"name": "Due Diligence", "name_i18n": {"en-US": "Due Diligence"}, "externalReferenceCode": "ACTIVITY_TYPE_DUE_DILIGENCE", "key": "due_diligence"},
        {"name": "Risk Assessment", "name_i18n": {"en-US": "Risk Assessment"}, "externalReferenceCode": "ACTIVITY_TYPE_RISK_ASSESSMENT", "key": "risk_assessment"},
        {"name": "Credit Analysis", "name_i18n": {"en-US": "Credit Analysis"}, "externalReferenceCode": "ACTIVITY_TYPE_CREDIT_ANALYSIS", "key": "credit_analysis"},
        {"name": "Compliance Check", "name_i18n": {"en-US": "Compliance Check"}, "externalReferenceCode": "ACTIVITY_TYPE_COMPLIANCE_CHECK", "key": "compliance_check"}
    ],
    195536: [  # ACTIVITY_STATUS
        {"name": "In Progress", "name_i18n": {"en-US": "In Progress"}, "externalReferenceCode": "ACTIVITY_STATUS_IN_PROGRESS", "key": "in_progress"},
        {"name": "On Hold", "name_i18n": {"en-US": "On Hold"}, "externalReferenceCode": "ACTIVITY_STATUS_ON_HOLD", "key": "on_hold"}
    ],
    195540: [  # LOAN_STATUS  
        {"name": "Under Review", "name_i18n": {"en-US": "Under Review"}, "externalReferenceCode": "LOAN_STATUS_UNDER_REVIEW", "key": "under_review"},
        {"name": "Paid Off", "name_i18n": {"en-US": "Paid Off"}, "externalReferenceCode": "LOAN_STATUS_PAID_OFF", "key": "paid_off"}
    ]
}

def normalize_key_alphanumeric(key):
    """Convert to pure alphanumeric keys"""
    # Remove all non-alphanumeric characters and convert to lowercase
    clean_key = re.sub(r'[^a-zA-Z0-9]', '', key).lower()
    return clean_key

def add_picklist_entry_retry(definition_id, entry_data, picklist_name):
    """Add individual entry with pure alphanumeric key"""
    # Clean the key completely
    clean_entry = {
        "key": normalize_key_alphanumeric(entry_data["key"]),
        "name": entry_data["name"],
        "name_i18n": entry_data["name_i18n"],
        "externalReferenceCode": entry_data["externalReferenceCode"]
    }
    
    entry_url = f"{API_URL}/{definition_id}/list-type-entries"
    
    print(f"   🔄 Retrying: {clean_entry['name']} (key: {clean_entry['key']})")
    
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
            print(f"   ✅ Successfully added: {clean_entry['name']}")
            return True
        else:
            print(f"   ❌ Still failed: {clean_entry['name']}")
            print(f"      Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error adding {clean_entry['name']}: {e}")
        return False

def main():
    """Retry all failed entries"""
    print("🔄 Retrying failed entries with alphanumeric keys...")
    
    total_entries = sum(len(entries) for entries in FAILED_ENTRIES.values())
    success_count = 0
    
    for definition_id, entries in FAILED_ENTRIES.items():
        print(f"\n📋 Retrying entries for definition ID: {definition_id}")
        
        for entry in entries:
            if add_picklist_entry_retry(definition_id, entry, f"def_{definition_id}"):
                success_count += 1
            time.sleep(0.3)  # Small delay
    
    print(f"\n📊 Retry Summary:")
    print(f"   ✅ Fixed: {success_count}/{total_entries}")
    print(f"   ❌ Still failing: {total_entries - success_count}/{total_entries}")
    
    if success_count == total_entries:
        print("\n🎉 All entries now working!")
    
    return 0

if __name__ == "__main__":
    main()