# --tests_report: create a junit file with the results of the tests and save the percentage of tests passed
def tests_report(project_data, summary):
    import xml.etree.ElementTree as ET
    if os.path.exists("marvin-data/results.json"):
        results_data = json.load(open("marvin-data/results.json"))
    else:
        results_data = {}
    root = ET.Element("testsuite")
    root.set("name", "Marvin")
    tests = 0
    passed = 0
    failed = 0
    skipped = 0
    for skill in project_data["skills"]:
        module = skill["name"]
        for test in skill["tests"]:
            tests += 1
            testcase = ET.SubElement(root, "testcase")
            testcase.set("name", test["name"])
            testcase.set("classname", module)
            if module in results_data and test["name"] in results_data[module]:
                if results_data[module][test["name"]]["status"] == "PASSED":
                    passed += 1
                else:
                    failed += 1
                    failure = ET.SubElement(testcase, "failure")
                    failure.set("message", results_data[module][test["name"]]["message"])
            else:
                skipped += 1
                ET.SubElement(testcase, "skipped")
    # print("===> Tests passed: " + str(passed))
    # print("===> Tests failed: " + str(failed + skipped))
    # print("===> Tests passing: " + str(round(passed / tests * 100, 2)) + "%")
    if (tests > 0):
        print("===> SUMMARY: " + str(passed) + "/" + str(tests) + " tests passed (" + str(round(passed / tests * 100, 2)) + "%).")
        summary["tests_passed"] = round(passed / tests * 100, 2)
    else:
        print("===> SUMMARY: No tests found.")
        summary["tests_passed"] = 0
    root.set("tests", str(tests))
    root.set("failures", str(failed))
    root.set("skipped", str(skipped))
    tree = ET.ElementTree(root)
    tree.write("marvin-data/tests_report.xml")

# --coverage: get the percentage of lines & branches covered by the unit tests
def coverage(summary):
    if os.path.exists("marvin-data/coverage_report.xml"):
        import xml.etree.ElementTree as ET
        tree = ET.parse("marvin-data/coverage_report.xml")
        root = tree.getroot()
        lines = 0
        lines_covered = 0
        branches = 0
        branches_covered = 0
        for elem in root:
            if elem.tag == "packages":
                for package in elem:
                    for classes in package:
                        if classes.tag == "classes":
                            for class_ in classes:
                                if class_.tag == "class":
                                    for lines_ in class_:
                                        if lines_.tag == "lines":
                                            for line in lines_:
                                                if line.tag == "line":
                                                    lines += 1
                                                    if line.get("hits") != "0":
                                                        lines_covered += 1
                                                    if line.get("branch") == "true":
                                                        tmp = line.get("condition-coverage")
                                                        branches += int(tmp.split("/")[1].split(")")[0])
                                                        branches_covered += int(tmp.split("/")[0].split("(")[1])
        # print("===> Lines covered: " + str(lines_covered))
        # print("===> Lines total: " + str(lines))
        # print("===> Lines coverage: " + str(round(lines_covered / lines * 100, 2)) + "%")
        # print("===> Branches covered: " + str(branches_covered))
        # print("===> Branches total: " + str(branches))
        # print("===> Branches coverage: " + str(round(branches_covered / branches * 100, 2)) + "%")
        if (lines > 0):
            summary["cov_lines"] = round(lines_covered / lines * 100, 2)
            print("===> SUMMARY: " + str(lines_covered) + "/" + str(lines) + " lines covered (" + str(round(lines_covered / lines * 100, 2)) + "%).")
        if (branches > 0):
            summary["cov_branches"] = round(branches_covered / branches * 100, 2)
            print("===> SUMMARY: " + str(branches_covered) + "/" + str(branches) + " branches covered (" + str(round(branches_covered / branches * 100, 2)) + "%).")
    else:
        summary["cov_lines"] = 0
        summary["cov_branches"] = 0

# --coding_style: report the number of major, minor and info issues found by banana coding style checker
def coding_style(summary):
    if not os.path.exists("marvin-data/coding_style_reports.txt"):
        return
    with open("marvin-data/coding_style_reports.txt") as f:
        content = f.readlines()
    content = [x.strip() for x in content]
    major = 0
    minor = 0
    info = 0
    for line in content:
        if "MINOR" in line:
            minor += 1
        elif "MAJOR" in line:
            major += 1
        elif "INFO" in line:
            info += 1
    # print("===> Major(s): " + str(major))
    # print("===> Minor(s): " + str(minor))
    # print("===> Info(s): " + str(info))
    malus = (major * 3) + (minor * 1)
    if malus >= 3:
        summary["bad_status"].append("Too many style errors")
        # print("===> SUMMARY: Too many style errors.")
    summary["style_major"] = major
    summary["style_minor"] = minor
    summary["style_info"] = info

if __name__ == "__main__":
    import json
    import os
    summary = dict()
    summary["bad_status"] = []
    summary["tests_passed"] = 0
    summary["cov_lines"] = 0
    summary["cov_branches"] = 0
    summary["style_major"] = 0
    summary["style_minor"] = 0
    summary["style_info"] = 0
    # if the file exists, read it
    if not os.path.exists("marvin-data/results.json"):
        summary["bad_status"].append("Build failed")
    with open("project-data/definition.json") as json_file:
        project_data = json.load(json_file)
        print("===> SUMMARY: Generating tests report.")
        tests_report(project_data, summary)
        print("===> SUMMARY: Tests report generated.")
    print("===> SUMMARY: Generating coverage report.")
    coverage(summary)
    print("===> SUMMARY: Coverage report generated.")
    print("===> SUMMARY: Generating coding style report.")
    coding_style(summary)
    print("===> SUMMARY: Coding style report generated.")
    with open("marvin-data/summary.json", "w") as outfile:
        json.dump(summary, outfile)
    print("===> SUMMARY: Done.")
