const vscode = require('vscode');
const axios = require('axios');
const qs = require('qs');

async function youdaoTranslate(text) {
  var args = {
    keyfrom: 'YouDaoCV',
    key: '659600698',
    type: 'data',
    doctype: 'json',
    version: '1.1',
    q: text
  };

  return new Promise((resolve, reject) => {
    var url = 'http://fanyi.youdao.com/openapi.do';
    axios.post(url, qs.stringify(args), {})
      .then(res => {
        try {
          resolve(res.data.basic.explains.join(" ;"));
      } catch (error) {
          resolve("单词未找到释义");
      }})
      .catch(err => {
        console.log(err);
        reject(err.data);
      });
  });
}

// 缓存字典
var WordDict = new Array();
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "ztrans" is now active!');
  let disposable = vscode.commands.registerCommand('ztrans.translate', async () => {
    const editor = vscode.window.activeTextEditor;
    // ignore if no file open !
    if (!editor) {
      return;
    }
    const selection = editor.selection;
    const document = editor.document;

    const textRange = selection.isEmpty ? document.getWordRangeAtPosition(selection.active) : selection;
    const text = document.getText(textRange);

    if (!text) {
      return;
    }

    let translation = "";

    if (text in WordDict) {
      translation = "[cache] " + WordDict[text]
    } else {
      translation = await youdaoTranslate(text);
      WordDict[text] = translation;
      translation = "[net] " + translation
    }
    vscode.window.setStatusBarMessage(translation, 7000);
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
