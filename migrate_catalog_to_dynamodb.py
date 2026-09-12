"""
migrate_catalog_to_dynamodb.py

One-time migration: reads catalog_export.json and batch-writes every product
into the "fitstyle-ai-Products" DynamoDB table created by Terraform.

After this runs successfully, DynamoDB is your catalog's source of truth --
this script (and Kaggle/HuggingFace) is not needed again. Products from here
on are added/edited/deleted through the admin dashboard -> server.ts -> DynamoDB.

Install: pip install boto3
Run:     python migrate_catalog_to_dynamodb.py

Uses the SAME credentials as your `aws configure` setup, OR set these env vars
explicitly (useful if you want to use the app_backend key instead of your
admin key, since app_backend already has exactly the DynamoDB permissions needed):

    setx AWS_ACCESS_KEY_ID "..."
    setx AWS_SECRET_ACCESS_KEY "..."
    setx AWS_DEFAULT_REGION "us-east-1"
"""

import json

import boto3

TABLE_NAME = "fitstyle-ai-Products"
REGION = "us-east-1"
INPUT_FILE = "catalog_export.json"
BATCH_SIZE = 25  # DynamoDB's hard limit per BatchWriteItem call


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Loaded {len(products)} products from {INPUT_FILE}")

    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    table = dynamodb.Table(TABLE_NAME)

    written = 0
    failed = []

    # table.batch_writer() auto-chunks into groups of 25 and retries throttled
    # requests for us -- simplest safe way to bulk-load with the boto3 resource API.
    with table.batch_writer(overwrite_by_pkeys=["id"]) as batch:
        for product in products:
            try:
                # DynamoDB rejects empty strings for some historical reasons in
                # older SDKs; guard against any accidentally-empty required field.
                if not product.get("id"):
                    failed.append(product)
                    continue
                batch.put_item(Item=product)
                written += 1
            except Exception as e:
                print(f"Failed on product {product.get('id')}: {e}")
                failed.append(product)

    print(f"\nDone. Written: {written} / {len(products)}")
    if failed:
        print(f"Failed: {len(failed)} -- see failed_products.json")
        with open("failed_products.json", "w", encoding="utf-8") as f:
            json.dump(failed, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
