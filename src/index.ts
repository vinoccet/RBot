import * as readlineSync from 'readline-sync';
import * as natural from 'natural';
import * as fs from 'fs'
import { WordTokenizer } from 'natural';
import path from 'path';


interface Rule {
  pattern: string;
  responses: string[];
}

interface RulesData {
  rules: Rule[];
}

interface Module {
    name: string;
    rules: Rule[];
  }
  
  const moduleManager: Module[] = [];
  
  function loadModules(): void {
    const moduleDirectory = process.cwd()+'/src/modules';
    const files = fs.readdirSync(moduleDirectory);
  
    files.forEach((file) => {
        if (path.extname(file) === '.json') {
          const filePath = path.join(moduleDirectory, file);
          const rawData = fs.readFileSync(filePath);
          const data: RulesData = JSON.parse(rawData.toString());
    
          const module: Module = {
            name: file.replace('.json', ''),
            rules: data.rules
          };
    
          moduleManager.push(module);
        }
      });
    }

  function findModule(input: string): Module | undefined {
    for (const module of moduleManager) {
      const matchingRule = module.rules.find((rule) => {
        const tokenizer=new natural.WordTokenizer();
        const patternTokens = tokenizer.tokenize(rule.pattern) as string[];
        const inputTokens = tokenizer.tokenize(input) as string[];
  
        const stemmer = natural.PorterStemmer;
        const inputStems = inputTokens.map((token) => stemmer.stem(token));
        const patternStems = patternTokens.map((token) => stemmer.stem(token));
  
        return inputStems.some((stem) => patternStems.includes(stem));
      });
  
      if (matchingRule) {
        return module;
      }
    }
  
    return undefined;
  }


function loadRules(): Rule[] {
  const rawData = fs.readFileSync('./rules.json');
  const data: RulesData = JSON.parse(rawData.toString());
  return data.rules;
}
let lastResponse = '';
function getResponse(input: string, rules: Rule[]): string {
  const tokenizer = new natural.WordTokenizer();
  const inputTokens = tokenizer.tokenize(input) as string[];

  for (const rule of rules) {
    const patternTokens = tokenizer.tokenize(rule.pattern) as string[];

    const stemmer = natural.PorterStemmer;
    const inputStems = inputTokens.map((token) => stemmer.stem(token));
    const patternStems = patternTokens.map((token) => stemmer.stem(token));

    const isMatch = inputStems.some((stem) => patternStems.includes(stem));
    if (isMatch) {
        const responses = rule.responses;
        let randomIndex = Math.floor(Math.random() * responses.length);
        
        // Choose a different response than the last one
        while (responses[randomIndex] === lastResponse) {
          randomIndex = Math.floor(Math.random() * responses.length);
        }
        
        lastResponse = responses[randomIndex];
        return responses[randomIndex];
    }
  }

  return "I'm sorry, I couldn't understand. Can you please rephrase your question?";
}
loadModules( );

function chatbot(module: string,input:string): string {
    const moduleMatch = findModule(module) as Module;
  
    if (module) {
      const rule = moduleMatch.rules.find((rule) => {
        const tokenizer=new WordTokenizer()
        const patternTokens = tokenizer.tokenize(rule.pattern) as string[];
        const inputTokens = tokenizer.tokenize(input) as string[];
  
        const stemmer = natural.PorterStemmer;
        const inputStems = inputTokens.map((token) => stemmer.stem(token));
        const patternStems = patternTokens.map((token) => stemmer.stem(token));
  
        return inputStems.some((stem) => patternStems.includes(stem));
      });
      console.log('****'+rule?.pattern)
      console.log('####'+rule?.responses)
  
      if (rule) {
        const responses = rule.responses;
        let randomIndex = Math.floor(Math.random() * rule.responses.length);
        while (responses[randomIndex] === lastResponse) {
            randomIndex = Math.floor(Math.random() * responses.length);
          }
          
          lastResponse = responses[randomIndex];
          return responses[randomIndex];
        }
    }
  
    return "I'm sorry, I couldn't understand. Can you please rephrase your question?";
  }

  
function chat() {
  while (true) {
    const input = readlineSync.question('User: ');

    if (input.toLowerCase() === 'exit') {
      break;
    }

    const response = chatbot('wellness',input);
    console.log(`ChatBot: ${response}`);
  }
}

chat();






