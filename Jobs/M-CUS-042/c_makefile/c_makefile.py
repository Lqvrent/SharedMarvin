# --usage: print usage
def usage():
    print('Usage: python3 project-data/c_makefile.py --compile|--dependencies|--rule=[rule_name]')
    exit(1)

# --compile: compile the project with make
def compile():
    import subprocess
    try:
        process = subprocess.Popen(['make'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=120)
        exit_code = process.wait()
    except subprocess.TimeoutExpired:
        print('KO: Compilation timed out.')
        exit(1)
    except Exception as e:
        print('KO: Compilation failed with exception: ' + str(e))
        exit(1)
    if exit_code != 0:
        print('KO: Compilation failed.')
        exit(1)
    else:
        print('OK')
        exit(0)

# --dependencies: check if a Makefile is correctly written, by running twice the make command
def dependencies():
    import subprocess
    try:
        process = subprocess.Popen(['make'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=120)
        exit_code = process.wait()
    except subprocess.TimeoutExpired:
        print('KO: Compilation timed out.')
        exit(1)
    except Exception as e:
        print('KO: Compilation failed with exception: ' + str(e))
        exit(1)
    if exit_code != 0:
        print('KO: Compilation failed.')
        print(error.decode('utf-8'))
        exit(1)
    try:
        process = subprocess.Popen(['make'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=120)
        exit_code = process.wait()
    except subprocess.TimeoutExpired:
        print('KO: Second compilation timed out.')
        exit(1)
    except Exception as e:
        print('KO: Second compilation failed with exception: ' + str(e))
        exit(1)
    if exit_code != 0:
        print('KO: Second compilation failed.')
        print(error.decode('utf-8'))
        exit(1)
    if output.decode('utf-8').find('Nothing to be done') == -1:
        print('KO: Dependencies are not correct, recompiling the project is not necessary.')
        print(output.decode('utf-8'))
        exit(1)
    else:
        print('OK')
        exit(0)


# --rule: check if a Makefile contains a specific rule
def rule(rule_name):
    import subprocess
    try:
        process = subprocess.Popen(['make', '-n', rule_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate(timeout=120)
        exit_code = process.wait()
    except subprocess.TimeoutExpired:
        print('KO: Rule "' + rule_name + '" timed out.')
        exit(1)
    except Exception as e:
        print('KO: Rule "' + rule_name + '" failed with exception: ' + str(e))
        exit(1)
    if exit_code != 0:
        print('KO: Rule "' + rule_name + '" not found.')
        print(error.decode('utf-8'))
        exit(1)
    else:
        print('OK')
        exit(0)

def main():
    import sys
    if len(sys.argv) != 2:
        usage()
    elif sys.argv[1] == '--compile':
        compile()
    elif sys.argv[1] == '--dependencies':
        dependencies()
    elif sys.argv[1].startswith('--rule='):
        rule_name = sys.argv[1][len('--rule='):]
        if rule_name == '':
            usage()
        rule(rule_name)
    else:
        usage()

if __name__ == "__main__":
    main()
