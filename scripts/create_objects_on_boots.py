#!/usr/bin/env python3

import requests
import json
import os
import sys
import base64
import time
import glob

# Boots Opticians API Configuration
BOOTS_URL = "https://webserver-lctbootsopticians-prd.lfr.cloud"
BOOTS_USERNAME = "nick@boots.com"
BOOTS_PASSWORD = "Gloria1234!"

def get_boots_auth_header():
    """Create Basic Auth header for Boots Opticians instance"""
    credentials = f"{BOOTS_USERNAME}:{BOOTS_PASSWORD}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def load_object_definition(file_path):
    """Load object definition from JSON file"""
    try:
        with open(file_path, 'r') as f:
            definition = json.load(f)
        return definition
    except Exception as e:
        print(f"❌ Error loading {file_path}: {str(e)}")
        return None

def create_object_definition(definition, file_name):
    """Create object definition on Boots instance"""
    url = f"{BOOTS_URL}/o/object-admin/v1.0/object-definitions"
    headers = {
        "Authorization": get_boots_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print(f"📤 Creating object: {definition['name']} ({file_name})")
    print(f"   Label: {definition['label']}")
    print(f"   Fields: {len(definition['objectFields'])}")
    
    # Remove folder reference for now - create without folder
    if 'objectFolderExternalReferenceCode' in definition:
        del definition['objectFolderExternalReferenceCode']
        print(f"   📁 Removed folder reference (will create in default folder)")
    
    try:
        response = requests.post(url, json=definition, headers=headers, timeout=60)
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            object_id = result.get('id')
            rest_path = result.get('restContextPath')
            print(f"   ✅ SUCCESS: Object created with ID {object_id}")
            print(f"   📡 REST Context Path: {rest_path}")
            
            # Publish the object
            print(f"   📤 Publishing object...")
            publish_response = requests.post(
                f"{url}/o/object-admin/v1.0/object-definitions/{object_id}/publish",
                headers=headers,
                timeout=60
            )
            
            if publish_response.status_code == 200:
                print(f"   ✅ Object published successfully!")
            else:
                print(f"   ⚠️ Publish warning: {publish_response.status_code}")
            
            return {
                'success': True,
                'id': object_id,
                'name': definition['name'],
                'restContextPath': rest_path,
                'definition': result
            }
        else:
            error_text = response.text
            print(f"   ❌ FAILED: {response.status_code}")
            print(f"   Error: {error_text[:200]}...")
            
            return {
                'success': False,
                'error': error_text,
                'status_code': response.status_code
            }
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def main():
    print("🚀 Creating Maestro objects on Boots Opticians instance...")
    
    # Find all object definition files
    object_files = [
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-clients.object-definition.json",
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-loans.object-definition.json", 
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-deals.object-definition.json",
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-gfd-activities.object-definition.json",
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-performance-kpis.object-definition.json",
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-risk-metrics.object-definition.json",
        "../liferay-workspace/client-extensions/maestro-objects/objects/maestro-workflow-metrics.object-definition.json"
    ]
    
    print(f"📋 Found {len(object_files)} object definitions to create")
    
    created_objects = []
    failed_objects = []
    
    for file_path in object_files:
        if not os.path.exists(file_path):
            print(f"⚠️ Skipping missing file: {file_path}")
            continue
            
        definition = load_object_definition(file_path)
        if not definition:
            failed_objects.append(file_path)
            continue
        
        result = create_object_definition(definition, os.path.basename(file_path))
        
        if result['success']:
            created_objects.append(result)
        else:
            failed_objects.append(file_path)
        
        # Brief pause between requests
        time.sleep(3)
    
    print(f"\n🎯 Migration Summary:")
    print(f"   ✅ Successfully created: {len(created_objects)}")
    print(f"   ❌ Failed: {len(failed_objects)}")
    
    if created_objects:
        print(f"\n📊 Created Objects:")
        for obj in created_objects:
            print(f"   - {obj['name']} (ID: {obj['id']})")
            print(f"     API: {obj['restContextPath']}")
    
    if failed_objects:
        print(f"\n❌ Failed Objects:")
        for obj in failed_objects:
            print(f"   - {obj}")
    
    return len(failed_objects) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)