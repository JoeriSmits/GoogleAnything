// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fetchUrl = require('fetch').fetchUrl;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.GoogleAnything', function () {
        // The code you place here will be executed every time your command is executed
        vscode.window.showInputBox().then(searchInput => {
            const webPanel = vscode.window.createWebviewPanel("vscode.previewHtml", searchInput, vscode.ViewColumn.Beside, { });

            fetchGoogleResultPage(searchInput, searchResultJson => {
                webPanel.webview.html = generateHTMLPreview(searchResultJson);
            });
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    console.log('Deactivated')
}
exports.deactivate = deactivate;

/**
 * Fetches the Google web page of the searchInput
 * @param {String} searchInput Search input string typed by the user
 * @returns {Void} Returns a callback with the JSON result of search results
 */
function fetchGoogleResultPage(searchInput, callback) {
    const config = vscode.workspace.getConfiguration('GoogleAnything');
    const googleApiKey = config.GoogleApiKey || 'AIzaSyAXjhjNugcBUObpIDtEyPNmcGsMEc2od_8';
    const googleCX = config.GoogleCX || '016921860309920165546:88b8m2fdcw8';
    const url = `https://www.googleapis.com/customsearch/v1?q=${searchInput}&key=${googleApiKey}&cx=${googleCX}`;

    fetchUrl(url, (_error, meta, body) => {
        if (meta.status !== 200) return callback(false)
        return callback(JSON.parse(body.toString()));
    });
}

/**
 * Generates a HTML page of the search results
 * @param {Object} searchResultJson JSON with search results
 */
function generateHTMLPreview(searchResultJson) {
    if(searchResultJson === false) return `<!DOCTYPE html><body><h1>Whoops, cannot reach Google :(</body></html>`;
    const results = searchResultJson.items;
    const htmlResults = results.map(result => {
        return `
            <a href="${result.link}">
                <h1>${result.htmlTitle}</h1>
            </a>
            <p>${result.htmlSnippet}</p>
        `;
    }).join('');

    return `<!DOCTYPE html>
        <!-- 
        Yikes! 
        If you're seeing this, VS Code has chosen to render this content as plain-text
        instead of HTML. As interesting as this file is, you'll need to close this and launch a
        new search to get any results.
        -->
        <head>
            <style>
                body {
                    background-color: ${new vscode.ThemeColor('editor.background')};
                    color: ${new vscode.ThemeColor('editor.foreground')};
                }
            </style>
        </head>
        
        <body>
            <a href="https://google.com/search?q=${searchResultJson.queries.request[0].searchTerms}">Open in Google Search</a>
            ${htmlResults}
        </body>
        </html>
    `;
}