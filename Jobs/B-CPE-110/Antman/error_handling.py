# --usage: print usage
def usage():
    print('Usage: python3 project-data/error_handling.py (arguments...)')
    exit(0)

# --usage: run antman and giantman with the given arguments
def run(args):
    import subprocess
    args_str = ' '.join(args)
    try:
        process = subprocess.Popen("./antman/antman " + args_str, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=5)
        exit_code = process.wait()
    except subprocess.TimeoutExpired:
        print('Antman timed out.')
        exit(1)
    except Exception as e:
        print('Antman failed with exception: ' + str(e))
        exit(1)
    # print("antman: " + output.decode('utf-8') + error.decode('utf-8'))
    switch = {
        127: "Antman binary not found",
        126: "Antman binary not executable",
        139: "Antman segfaulted"
    }
    print(switch.get(exit_code, "Antman exited with code %d" % exit_code))
    try:
        process = subprocess.Popen("./giantman/giantman " + args_str, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=5)
        exit_code = process.wait()
    except subprocess.TimeoutExpired:
        print('Giantman timed out.')
        exit(1)
    except Exception as e:
        print('Giantman failed with exception: ' + str(e))
        exit(1)
    # print("giantman: " + output.decode('utf-8') + error.decode('utf-8'))
    switch = {
        127: "Giantman binary not found",
        126: "Giantman binary not executable",
        139: "Giantman segfaulted"
    }
    print(switch.get(exit_code, "Giantman exited with code %d" % exit_code))
    exit(0)

def main():
    import sys
    if len(sys.argv) == 2 and (sys.argv[1] == '-h' or sys.argv[1] == '--help'):
        usage()
    run(sys.argv[1:])

if __name__ == "__main__":
    main()
