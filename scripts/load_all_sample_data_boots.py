#!/usr/bin/env python3

import requests
import json
import os
import sys
import base64
import time
import glob
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

def load_sample_data_file(file_path):
    """Load sample data from JSON file"""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Handle Liferay batch format with 'items' array
        if isinstance(data, dict) and 'items' in data:
            return data['items']
        # Handle direct array format
        elif isinstance(data, list):
            return data
        else:
            print(f"⚠️ Unexpected data format in {file_path}")
            return None
            
    except Exception as e:
        print(f"❌ Error loading {file_path}: {str(e)}")
        return None

def upload_data_to_object(data_records, object_api_path, object_name):
    """Upload data records to a Liferay object via REST API"""
    
    headers = {
        "Authorization": get_boots_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    url = f"{BOOTS_URL}{object_api_path}"
    
    print(f"📤 Uploading {len(data_records)} records to {object_name}...")
    print(f"   API Endpoint: {object_api_path}")
    
    success_count = 0
    failed_count = 0
    
    for i, record in enumerate(data_records):
        try:
            # Remove any system fields that shouldn't be included in creation
            clean_record = record.copy()
            
            # Remove system/read-only fields
            for field in ['id', 'dateCreated', 'dateModified', 'creator', 'createDate']:
                if field in clean_record:
                    del clean_record[field]
            
            response = requests.post(url, json=clean_record, headers=headers, timeout=30)
            
            if response.status_code in [200, 201]:
                success_count += 1
                if (i + 1) % 10 == 0 or i == len(data_records) - 1:
                    print(f"   📊 Progress: {i + 1}/{len(data_records)} ({success_count} successful)")
            else:
                failed_count += 1
                if failed_count <= 5:  # Only show first 5 errors
                    print(f"   ❌ Failed record {i+1}: {response.status_code} - {response.text[:100]}")
            
            # Brief pause to avoid overwhelming the API
            if i % 5 == 0:
                time.sleep(0.5)
                
        except Exception as e:
            failed_count += 1
            if failed_count <= 5:
                print(f"   ❌ Exception for record {i+1}: {str(e)}")
    
    print(f"   ✅ Upload complete: {success_count} successful, {failed_count} failed")
    return success_count, failed_count

def main():
    print("🚀 Loading ALL Maestro sample data to Boots Opticians...")
    
    # Object mappings: file pattern -> API path, object name (using expanded data with more records)
    data_mappings = [
        {
            "file_pattern": "../expanded_data/expanded-clients.json",
            "api_path": "/o/c/maestroclients", 
            "object_name": "Maestro Clients"
        },
        {
            "file_pattern": "../expanded_data/expanded-loans.json",
            "api_path": "/o/c/maestroloans",
            "object_name": "Maestro Loans"
        },
        {
            "file_pattern": "../expanded_data/expanded-deals.json", 
            "api_path": "/o/c/maestrodeals",
            "object_name": "Maestro Deals"
        },
        {
            "file_pattern": "../expanded_data/expanded-activities.json",
            "api_path": "/o/c/gfdactivitieses",
            "object_name": "GFD Activities"
        },
        {
            "file_pattern": "../expanded_data/expanded-performance-kpis.json",
            "api_path": "/o/c/performancekpis",
            "object_name": "Performance KPIs"
        },
        {
            "file_pattern": "../expanded_data/expanded-risk-metrics.json",
            "api_path": "/o/c/riskmetricses", 
            "object_name": "Risk Metrics"
        },
        {
            "file_pattern": "../expanded_data/expanded-workflow-metrics.json",
            "api_path": "/o/c/workflowmetricses",
            "object_name": "Workflow Metrics"
        }
    ]
    
    total_uploaded = 0
    total_failed = 0
    
    for mapping in data_mappings:
        file_path = mapping["file_pattern"]
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"⚠️ Skipping missing file: {file_path}")
            continue
        
        # Load data
        data = load_sample_data_file(file_path)
        if not data:
            print(f"⚠️ No data loaded from: {file_path}")
            continue
        
        # Upload to Boots instance
        success, failed = upload_data_to_object(
            data, 
            mapping["api_path"], 
            mapping["object_name"]
        )
        
        total_uploaded += success
        total_failed += failed
        
        # Pause between object types
        print(f"   ⏳ Pausing before next object type...")
        time.sleep(3)
    
    print(f"\n🎯 FINAL MIGRATION SUMMARY:")
    print(f"   ✅ Total records uploaded: {total_uploaded}")
    print(f"   ❌ Total records failed: {total_failed}")
    print(f"   📊 Success rate: {(total_uploaded / (total_uploaded + total_failed)) * 100:.1f}%" if (total_uploaded + total_failed) > 0 else "No data processed")
    
    return total_failed == 0

if __name__ == "__main__":
    success = main()
    print(f"\n{'✅ ALL SAMPLE DATA LOADED SUCCESSFULLY!' if success else '⚠️ Some data uploads failed - check logs above'}")
    sys.exit(0 if success else 1)