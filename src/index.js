"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readlineSync = require("readline-sync");
var natural = require("natural");
var fs = require("fs");
var natural_1 = require("natural");
var path_1 = require("path");
var moduleManager = [];
function loadModules() {
    var moduleDirectory = process.cwd() + '/modules';
    var files = fs.readdirSync(moduleDirectory);
    files.forEach(function (file) {
        if (path_1.default.extname(file) === '.json') {
            var filePath = path_1.default.join(moduleDirectory, file);
            var rawData = fs.readFileSync(filePath);
            var data = JSON.parse(rawData.toString());
            var module_1 = {
                name: file.replace('.json', ''),
                rules: data.rules
            };
            moduleManager.push(module_1);
        }
    });
}
function findModule(input) {
    for (var _i = 0, moduleManager_1 = moduleManager; _i < moduleManager_1.length; _i++) {
        var module_2 = moduleManager_1[_i];
        var matchingRule = module_2.rules.find(function (rule) {
            var tokenizer = new natural.WordTokenizer();
            var patternTokens = tokenizer.tokenize(rule.pattern);
            var inputTokens = tokenizer.tokenize(input);
            var stemmer = natural.PorterStemmer;
            var inputStems = inputTokens.map(function (token) { return stemmer.stem(token); });
            var patternStems = patternTokens.map(function (token) { return stemmer.stem(token); });
            return inputStems.some(function (stem) { return patternStems.includes(stem); });
        });
        if (matchingRule) {
            return module_2;
        }
    }
    return undefined;
}
function loadRules() {
    var rawData = fs.readFileSync('./rules.json');
    var data = JSON.parse(rawData.toString());
    return data.rules;
}
var lastResponse = '';
function getResponse(input, rules) {
    var tokenizer = new natural.WordTokenizer();
    var inputTokens = tokenizer.tokenize(input);
    var _loop_1 = function (rule) {
        var patternTokens = tokenizer.tokenize(rule.pattern);
        var stemmer = natural.PorterStemmer;
        var inputStems = inputTokens.map(function (token) { return stemmer.stem(token); });
        var patternStems = patternTokens.map(function (token) { return stemmer.stem(token); });
        var isMatch = inputStems.some(function (stem) { return patternStems.includes(stem); });
        if (isMatch) {
            var responses = rule.responses;
            var randomIndex = Math.floor(Math.random() * responses.length);
            // Choose a different response than the last one
            while (responses[randomIndex] === lastResponse) {
                randomIndex = Math.floor(Math.random() * responses.length);
            }
            lastResponse = responses[randomIndex];
            return { value: responses[randomIndex] };
        }
    };
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        var state_1 = _loop_1(rule);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return "I'm sorry, I couldn't understand. Can you please rephrase your question?";
}
loadModules();
function chatbot(module, input) {
    var moduleMatch = findModule(module);
    if (module) {
        var rule = moduleMatch.rules.find(function (rule) {
            var tokenizer = new natural_1.WordTokenizer();
            var patternTokens = tokenizer.tokenize(rule.pattern);
            var inputTokens = tokenizer.tokenize(input);
            var stemmer = natural.PorterStemmer;
            var inputStems = inputTokens.map(function (token) { return stemmer.stem(token); });
            var patternStems = patternTokens.map(function (token) { return stemmer.stem(token); });
            return inputStems.some(function (stem) { return patternStems.includes(stem); });
        });
        console.log('****' + (rule === null || rule === void 0 ? void 0 : rule.pattern));
        console.log('####' + (rule === null || rule === void 0 ? void 0 : rule.responses));
        if (rule) {
            var responses = rule.responses;
            var randomIndex = Math.floor(Math.random() * rule.responses.length);
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
        var input = readlineSync.question('User: ');
        if (input.toLowerCase() === 'exit') {
            break;
        }
        var response = chatbot('wellness', input);
        console.log("ChatBot: ".concat(response));
    }
}
chat();
