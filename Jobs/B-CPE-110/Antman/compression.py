# --usage: print usage
def usage(exit_code):
    print('Usage: python3 project-data/compression.py [original_file] [compression_type]')
    print('Compression types: 1, 2, 3 (lyrics, html, ppm)')
    exit(exit_code)

# --run: run antman and giantman with the given arguments
def run(original_file, compression_type):
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
    # Uncompress file
    process = subprocess.Popen("./giantman/giantman compressed.data " + compression_type + " > uncompressed.data", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
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
    # Check if the uncompressed file is the same as the original
    process = subprocess.Popen("diff " + original_file + " uncompressed.data > diff.comp", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate(timeout=10)
    exit_code = process.wait()
    # print("diff: " + output.decode('utf-8') + error.decode('utf-8'))
    if exit_code != 0:
        print("KO: Uncompressed file is different from the original file")
        process = subprocess.Popen("cat -e diff.comp", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=5)
        exit_code = process.wait()
        # print("cat: " + output.decode('utf-8') + error.decode('utf-8'))
        print(output.decode('utf-8'))
        exit(84)
    # Check if the compressed file is bigger than the original
    original_size = os.path.getsize(original_file)
    compressed_size = os.path.getsize("compressed.data")
    if compressed_size > original_size:
        print("KO: Compressed file is bigger than the original file, original size: %d, compressed size: %d" % (original_size, compressed_size))
        exit(84)
    print("OK")
    # Clean up
    os.remove("compressed.data")
    os.remove("uncompressed.data")
    os.remove("diff.comp")
    exit(0)

def main():
    import sys
    if len(sys.argv) == 2 and (sys.argv[1] == '-h' or sys.argv[1] == '--help'):
        usage(0)
    if len(sys.argv) != 3:
        usage(84)
    if sys.argv[2] != '1' and sys.argv[2] != '2' and sys.argv[2] != '3':
        usage(84)
    run(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    main()
