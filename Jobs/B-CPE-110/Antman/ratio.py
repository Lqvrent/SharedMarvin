# --usage: print usage
def usage(exit_code):
    print('Usage: python3 project-data/ratio.py [wanted_ratio] [original_file] [compression_type]')
    print('Wanted ratio: 0 <= integer <= 100')
    print('Compression types: 1, 2, 3 (lyrics, html, ppm)')
    exit(exit_code)

# --run: run antman and giantman with the given arguments and check the ratio
def run(wanted_ratio, original_file, compression_type):
    import subprocess
    import os
    # Compress file
    process = subprocess.Popen("./antman/antman " + original_file + " " + compression_type + " > compressed.data", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate(timeout=30)
    exit_code = process.wait()
    # print("antman: " + output.decode('utf-8') + error.decode('utf-8'))
    switch = {
        127: "KO: Antman binary not found",
        126: "KO: Antman binary not executable",
        139: "KO: Antman segfaulted"
    }
    if exit_code != 0:
        print(switch.get(exit_code, "KO: Antman exited with code %d" % exit_code))
        exit(84)
    # Decompress file
    process = subprocess.Popen("./giantman/giantman compressed.data " + compression_type + " > decompressed.data", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate(timeout=30)
    exit_code = process.wait()
    # print("giantman: " + output.decode('utf-8') + error.decode('utf-8'))
    switch = {
        127: "KO: Giantman binary not found",
        126: "KO: Giantman binary not executable",
        139: "KO: Giantman segfaulted"
    }
    if exit_code != 0:
        print(switch.get(exit_code, "KO: Giantman exited with code %d" % exit_code))
        exit(84)
    # Check ratio
    original_size = os.path.getsize(original_file)
    compressed_size = os.path.getsize("compressed.data")
    decompressed_size = os.path.getsize("decompressed.data")
    ratio = compressed_size / original_size * 100
    if compressed_size > original_size:
        print("KO: Compressed file is bigger than original file, original size: %d, compressed size: %d" % (original_size, compressed_size))
        exit(84)
    if ratio < wanted_ratio:
        print("KO: Ratio too low, wanted %d%%, got %d%%" % (wanted_ratio, ratio))
        exit(84)
    if decompressed_size != original_size:
        print("KO: Decompressed file is not the same size as original file, original size: %d, decompressed size: %d" % (original_size, decompressed_size))
        exit(84)
    print("OK")
    # Clean up
    os.remove("compressed.data")
    os.remove("decompressed.data")
    exit(0)

def main():
    import sys
    import os
    if len(sys.argv) != 4:
        usage(84)
    wanted_ratio = int(sys.argv[1])
    if wanted_ratio < 0 or wanted_ratio > 100:
        usage(84)
    original_file = sys.argv[2]
    if not os.path.isfile(original_file):
        print("KO: Original file not found")
        exit(84)
    compression_type = sys.argv[3]
    if compression_type != "1" and compression_type != "2" and compression_type != "3":
        usage(84)
    run(wanted_ratio, original_file, compression_type)

if __name__ == "__main__":
    main()