"""Bundle all 4 Debt Payoff Tracker variants into a ZIP."""

import os
import zipfile

OUTPUT_DIR = "/mnt/c/Users/jayso/businesses/etsy-templates/products/v2/output/007-debt-payoff-tracker"
ZIP_NAME = "Debt-Payoff-Tracker-Bundle.zip"

def main():
    zip_path = os.path.join(OUTPUT_DIR, ZIP_NAME)

    # Remove old zip if exists
    if os.path.exists(zip_path):
        os.remove(zip_path)

    # Find all xlsx files
    files = sorted(f for f in os.listdir(OUTPUT_DIR) if f.endswith('.xlsx'))
    print(f'Found {len(files)} files:')

    if len(files) != 4:
        print(f'ERROR: Expected 4 .xlsx files, got {len(files)}')
        return

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            filepath = os.path.join(OUTPUT_DIR, f)
            zf.write(filepath, f)
            size_kb = os.path.getsize(filepath) / 1024
            print(f'  {f} ({size_kb:.1f} KB)')

    zip_size = os.path.getsize(zip_path)
    print(f'\n\u2713 {ZIP_NAME} created ({zip_size / 1024:.1f} KB)')
    print(f'  Location: {zip_path}')


if __name__ == '__main__':
    main()
