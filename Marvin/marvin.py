# --usage: print usage
def usage():
    print('Usage: python3 marvin-data/marvin.py --building|--setup|--testing')
    exit(1)

# --building: build the project
def building():
    import json
    import subprocess
    with open('project-data/definition.json', 'r') as json_file:
        with open('marvin-data/build_logs.txt', 'a') as logs_file:
            data = json.load(json_file)
            for command in data['build-commands']:
                print("===> BUILD: Running command build '" + command + "'.")
                print(command)
                logs_file.write(command + '\n')
                try:
                    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                    output, error = process.communicate(timeout=120)
                    exit_code = process.wait()
                except subprocess.TimeoutExpired:
                    print('===> BUILD: Command timed out.')
                    logs_file.write('Timed out.\n')
                    exit(1)
                except Exception as e:
                    print('===> BUILD: Command failed with exception: ' + str(e))
                    logs_file.write('Failed with exception: ' + str(e) + '\n')
                    exit(1)
                print(output.decode('utf-8') + error.decode('utf-8'))
                logs_file.write(output.decode('utf-8') + error.decode('utf-8'))
                if exit_code != 0:
                    print('===> BUILD: Command failed with exit code ' + str(exit_code) + '.')
                    exit(1)
            print("===> BUILD: Done.")
    exit(0)

# --setup: setup the project
def setup():
    import json
    import subprocess
    with open('project-data/definition.json', 'r') as json_file:
        data = json.load(json_file)
        if 'setup-commands' not in data or len(data['setup-commands']) == 0:
            print("===> SETUP: No setup commands.")
            exit(0)
        for command in data['setup-commands']:
            print("===> SETUP: Running command setup \"" + command + "\".")
            print(command)
            try:
                process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                output, error = process.communicate(timeout=120)
                exit_code = process.wait()
            except subprocess.TimeoutExpired:
                print('===> SETUP: Command timed out.')
                exit(1)
            except Exception as e:
                print('===> SETUP: Command failed with exception: ' + str(e))
                exit(1)
            print(output.decode('utf-8') + error.decode('utf-8'))
            if exit_code != 0:
                print('===> SETUP: Command failed with exit code ' + str(exit_code) + '.')
                exit(1)
        print("===> SETUP: Done.")

# --testing: run the tests
def testing():
    import json
    import subprocess
    results = dict()
    with open('project-data/definition.json') as json_file:
        data = json.load(json_file)
        for skill in data['skills']:
            results[skill["name"]] = dict()
            print("===> TESTING: Starting tests for skill '" + skill["name"] + "'.")
            for test in skill["tests"]:
                print("===> TESTING: Starting test '" + test["name"] + "'.")
                print(test["command"])
                results[skill["name"]][test["name"]] = dict()
                try:
                    process = subprocess.Popen(test["command"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                    output, error = process.communicate(timeout=60)
                    exit_code = process.wait()
                except subprocess.TimeoutExpired:
                    print('===> TESTING: Command timed out.')
                    results[skill["name"]][test["name"]]['status'] = 'FAILED'
                    results[skill["name"]][test["name"]]['message'] = 'Timed out after 60 seconds.'
                    continue
                except Exception as e:
                    print('===> TESTING: Command failed with exception: ' + str(e))
                    results[skill["name"]][test["name"]]['status'] = 'FAILED'
                    results[skill["name"]][test["name"]]['message'] = 'Failed with exception: ' + str(e)
                    continue
                print(output.decode('utf-8'), error.decode('utf-8'))
                results[skill["name"]][test["name"]]['status'] = 'PASSED' if output.decode('utf-8') == test["expected"] else 'FAILED'
                if (output.decode('utf-8') != test["expected"]):
                    results[skill["name"]][test["name"]]['message'] = 'Expected:\n' + test["expected"] + '\nBut got:\n' + (output.decode('utf-8') + error.decode('utf-8'))
                else:
                    results[skill["name"]][test["name"]]['message'] = test["expected"]
                print("===> TESTING: Test '" + test["name"] + "' status: " + results[skill["name"]][test["name"]]['status'] + ".")
            print("===> TESTING: Ending tests for skill '" + skill["name"] + "'.")
    print("===> TESTING: Done.")
    with open('marvin-data/results.json', 'w') as outfile:
        json.dump(results, outfile)
    print("===> TESTING: Results saved.")
    exit(0)

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        usage()
    elif sys.argv[1] == '--building':
        building()
    elif sys.argv[1] == '--setup':
        setup()
    elif sys.argv[1] == '--testing':
        testing()
    else:
        usage()
