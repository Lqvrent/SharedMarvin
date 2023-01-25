# Welcome to the contributing guide for the SharedMarvin project
Thank you for investing your time in contributing to our project !<br />
Any contribution you make will be **greatly appreciated** and will be available to all students once merged.

## 🚀 Getting Started
Before continuing, we **strongly** recommend you to read the [hosting guide](HOSTING.md) to understand how the project works, and tests your changes locally.
To create a pull request, you will need to fork the project, and create a new branch from the `main` branch.
You can then make your changes, and create a pull request to the `main` branch.

## 📝 Writing tests
To add tests to the project, you'll need to create the following structure in your repository:
```tree
.
├── Bridge
├── Database
├── Interface
├── Jenkins
├── Jobs <-- This is where all the tests are defined
│   └── B-XXX-100 <-- This folder MUST have the name of the module, and can contain multiple projects
│       └──project <-- This folder MUST have the name of the project
│           ├── definition.json <-- This file will define the tests to run and the configuration
│           └── ... <-- You can add additionnals files in the project folder to use in your tests, we'll take a look at this later
├── Marvin
├── Proxy
├── ...
├── CONTRIBUTING.md
├── HOSTING.md
└── README.md
```
The `definition.json` file must have the following structure:
```json
{
    "description": "This jobs tests the XXX project", // This is the description what the tests does
    "enable-coding-style": true, // This will enable the coding style report (designed only for C projects)
    "enable-coverage": true, // This will enable the coverage report (will run make tests_run rule)
    "setup-commands": [ // This commands will be executed in silence, before building the project
        "make -C project-data/test_lib"
    ],
    "build-commands": [ // This commands will be executed to build the project
        "make re"
    ],
    "skills": [
        {
            "name": "Error handling", // This is the name of a skill/category
            "tests": [
                {
                    "name": "No argument",
                    "command": "./project && echo $?", // This is the command to run
                    "expected": "84\n" // This is the expected output, if the output is strictly equal to this, the test will pass
                },
                ...
            ]
        },
        ...
    ]
}
```
And voilà ! You just made your first basic tests. But what if we want to do some advanced tests ?<br />
For this, we let you the possibility to add custom files in the project folder, and use them in your tests.<br />
When running the tests, the project folder will be copied in the `project-data` folder, so you can use it in your tests.<br />
Per exemple, if you want to create a `mouli.sh` that takes the argument `42`, and print `OK\n` if the test passed, you can do the following:
```json
{
    ...
    "skills": [
        {
            "name": "Basic tests",
            "tests": [
                {
                    "name": "Mouli",
                    "command": "./project-data/mouli.sh 42",
                    "expected": "OK\n"
                },
                ...
            ]
        },
        ...
    ]
}
```
You're now ready to write your own tests !<br />

## 📝 Commit messages guidelines
To keep a clean commit history, we ask you to follow the following guidelines:
- Must be in english
- Must be in lowercase
- Must be in imperative mood
- Must follow https://commitlint.io/, you can use it to generate your commit messages
