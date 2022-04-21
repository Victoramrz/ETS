'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const javaPmd_1 = require("./lib/javaPmd");
exports.JavaPmd = javaPmd_1.JavaPmd;
const config_1 = require("./lib/config");
const appStatus_1 = require("./lib/appStatus");
const debounce_1 = require("debounce");
const utils_1 = require("./lib/utils");
const supportedLanguageCodes = ['java'];
const isSupportedLanguage = (langCode) => 0 <= supportedLanguageCodes.indexOf(langCode);
const appName = 'Java PMD';
const settingsNamespace = 'javaPMD';
const collection = vscode.languages.createDiagnosticCollection('java-pmd');
const outputChannel = vscode.window.createOutputChannel(appName);
function activate(context) {
    //setup config
    const config = new config_1.Config(context);
    //setup instance vars
    const pmd = new javaPmd_1.JavaPmd(outputChannel, config);
    appStatus_1.AppStatus.setAppName(appName);
    appStatus_1.AppStatus.getInstance().ok();
    context.subscriptions.push(vscode.commands.registerCommand('java-pmd.clearProblems', () => {
        collection.clear();
    }));
    //setup commands
    context.subscriptions.push(vscode.commands.registerCommand('java-pmd.runWorkspace', () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running Static Analysis on workspace',
            cancellable: true,
        }, (progress, token) => {
            progress.report({ increment: 0 });
            return pmd.run(utils_1.getRootWorkspacePath(), collection, progress, token);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('java-pmd.runFile', (fileName) => {
        if (!fileName) {
            fileName = vscode.window.activeTextEditor.document.fileName;
        }
        pmd.run(fileName, collection);
    }));
    //setup listeners
    if (config.runOnFileSave) {
        vscode.workspace.onDidSaveTextDocument((textDocument) => {
            if (isSupportedLanguage(textDocument.languageId)) {
                return vscode.commands.executeCommand('java-pmd.runFile', textDocument.fileName);
            }
        });
    }
    if (config.runOnFileChange) {
        vscode.workspace.onDidChangeTextDocument(debounce_1.debounce((textDocumentChangeEvent) => {
            const textDocument = textDocumentChangeEvent.document;
            if (isSupportedLanguage(textDocument.languageId)) {
                return vscode.commands.executeCommand('java-pmd.runFile', textDocument.fileName);
            }
        }, config.onFileChangeDebounce));
    }
    if (config.runOnFileOpen) {
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (isSupportedLanguage(editor.document.languageId)) {
                return vscode.commands.executeCommand('java-pmd.runFile', editor.document.fileName, true);
            }
        });
    }
    vscode.workspace.onDidChangeConfiguration((configChange) => {
        if (configChange.affectsConfiguration(settingsNamespace)) {
            config.init();
            return pmd.updateConfiguration(config);
        }
    });
    context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors((editors) => {
        const isStatusNeeded = editors.some((e) => e.document && isSupportedLanguage(e.document.languageId));
        if (isStatusNeeded) {
            appStatus_1.AppStatus.getInstance().show();
        }
        else {
            appStatus_1.AppStatus.getInstance().hide();
        }
    }));
}
exports.activate = activate;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map