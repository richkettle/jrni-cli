# bbug-apps-cli

## Installation 

```npm install -g```

## Panel package requirements

- must have entry.js file which can use glob imports, example content:
    ```import './vidyo_panel/**/!(*.spec).js';```

- must have manifest.json file which specifies 'unique_name' property    

## Usage 
Go to the root of you khufu project and trigger following command: 

```bbug-apps-cli```

