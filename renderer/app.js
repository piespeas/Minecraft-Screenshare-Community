const fs = require("fs");
const path = require("path");
const https = require("https");
const os = require("os");
const { clipboard } = require('electron');

const apps = [
    { name: "KernelLiveDumpTool.exe", url: "https://github.com/spokwn/KernelLiveDumpTool/releases/download/v1.1/KernelLiveDumpTool.exe" },
    { name: "BAMParser.exe", url: "https://github.com/spokwn/BAM-parser/releases/download/v1.2.9/BAMParser.exe" },
    { name: "PathsParser.exe", url: "https://github.com/spokwn/PathsParser/releases/download/v1.2/PathsParser.exe" },
    { name: "JournalTrace.exe", url: "https://github.com/spokwn/JournalTrace/releases/download/1.2/JournalTrace.exe" },
    { name: "espouken.exe", url: "https://github.com/spokwn/Tool/releases/download/v1.1.3/espouken.exe" },
    { name: "PcaSvcExecuted.exe", url: "https://github.com/spokwn/pcasvc-executed/releases/download/v0.8.7/PcaSvcExecuted.exe" },
    { name: "BamDeletedKeys.exe", url: "https://github.com/spokwn/BamDeletedKeys/releases/download/v1.0/BamDeletedKeys.exe" },
    { name: "PrefetchParser.exe", url: "https://github.com/spokwn/prefetch-parser/releases/download/v1.5.5/PrefetchParser.exe" },
    { name: "ActivitiesCacheParser.exe", url: "https://github.com/spokwn/ActivitiesCache-execution/releases/download/v0.6.5/ActivitiesCacheParser.exe" },
    { name: "AmcacheParser.zip", url: "https://download.ericzimmermanstools.com/net9/AmcacheParser.zip" },
    { name: "AppCompatCacheParser.zip", url: "https://download.ericzimmermanstools.com/net9/AppCompatCacheParser.zip" },
    { name: "JumpListExplorer.zip", url: "https://download.ericzimmermanstools.com/net9/JumpListExplorer.zip" },
    { name: "bstrings.zip", url: "https://download.ericzimmermanstools.com/net9/bstrings.zip" },
    { name: "PECmd.zip", url: "https://download.ericzimmermanstools.com/net9/PECmd.zip" },
    { name: "SrumECmd.zip", url: "https://download.ericzimmermanstools.com/net9/SrumECmd.zip" },
    { name: "TimelineExplorer.zip", url: "https://download.ericzimmermanstools.com/net9/TimelineExplorer.zip" },
    { name: "RegistryExplorer.zip", url: "https://download.ericzimmermanstools.com/net9/RegistryExplorer.zip" },
    { name: "MFTECmd.zip", url: "https://download.ericzimmermanstools.com/net9/MFTECmd.zip" },
    { name: "WinPrefetchView.zip", url: "https://www.nirsoft.net/utils/winprefetchview-x64.zip" },
    { name: "USBDeview.zip", url: "https://www.nirsoft.net/utils/usbdeview-x64.zip" },
    { name: "NetworkUsageView.zip", url: "https://www.nirsoft.net/utils/networkusageview-x64.zip" },
    { name: "AlternateStreamView.zip", url: "https://www.nirsoft.net/utils/alternatestreamview-x64.zip" },
    { name: "UninstallView.zip", url: "https://www.nirsoft.net/utils/uninstallview-x64.zip" },
    { name: "PreviousFilesRecovery.zip", url: "https://www.nirsoft.net/utils/previousfilesrecovery-x64.zip" },
    { name: "AltDetector.exe", url: "https://github.com/praiselily/AltDetector/releases/download/Detector/AltDetector.exe" },
    { name: "FakerFinder.jar", url: "https://github.com/praiselily/WeHateFakers/releases/download/Screenshare/FakerFinder.jar" },
    { name: "hardlink.exe", url: "https://github.com/praiselily/HardlinkFinder/releases/download/Tools/hardlink.exe" },
    { name: "SystemInformer.exe", url: "https://github.com/winsiderss/si-builds/releases/download/3.2.25297.1516/systeminformer-build-canary-setup.exe" },
    { name: "Everything.exe", url: "https://www.voidtools.com/Everything-1.4.1.1029.x86-Setup.exe" },
    { name: "InjGen.exe", url: "https://github.com/NotRequiem/InjGen/releases/download/v2.0/InjGen.exe" },
    { name: "PrefetchViewPlus.exe", url: "https://github.com/Orbdiff/PrefetchView/releases/download/v1.5.4/PrefetchView++.exe" },
    { name: "Velociraptor.exe", url: "https://github.com/Velocidex/velociraptor/releases/download/v0.6.6-1/velociraptor-v0.6.6-3-windows-386.exe" },
    { name: "Recaf.jar", url: "https://github.com/Col-E/Recaf/releases/download/4.0.0-alpha/recaf-4x-alpha-win-86x64.jar" },
    { name: "Hayabusa.zip", url: "https://github.com/Yamato-Security/hayabusa/releases/download/v3.6.0/hayabusa-3.6.0-win-x64.zip" },
    { name: "dotnet-sdk.exe", url: "https://builds.dotnet.microsoft.com/dotnet/Sdk/9.0.306/dotnet-sdk-9.0.306-win-x64.exe" }
];

const downloadDir = path.join(os.homedir(), "Downloads", "Screenshare Tools");

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

function updateUI(progress, msg, sub) {
    window.dispatchEvent(new CustomEvent("ui-update", {
        detail: { progress, msg, sub }
    }));
}

// Download file scripts
function downloadFile(url, outputPath, onProgress) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (res) => {
            // Handle Redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, outputPath, onProgress).then(resolve).catch(reject);
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }

            const totalSize = parseInt(res.headers["content-length"] || "0");
            let downloaded = 0;
            const file = fs.createWriteStream(outputPath);

            res.on("data", (chunk) => {
                downloaded += chunk.length;
                if (totalSize > 0) {
                    const percent = Math.floor((downloaded / totalSize) * 100);
                    onProgress(percent);
                }
            });

            res.pipe(file);

            file.on("finish", () => {
                file.close(() => resolve());
            });

            file.on("error", (err) => {
                fs.unlink(outputPath, () => reject(err));
            });

        }).on("error", (err) => {
            fs.unlink(outputPath, () => reject(err));
        });
    });
}

async function runInstaller() {
    const total = apps.length;

    for (let i = 0; i < total; i++) {
        const app = apps[i];
        const output = path.join(downloadDir, app.name);

        try {
            updateUI(Math.floor((i / total) * 100), `Preparing ${app.name}`, "Starting download...");

            await downloadFile(app.url, output, (fileProgress) => {
                updateUI(
                    Math.floor((i / total) * 100 + fileProgress / total),
                    `Downloading ${app.name}`,
                    `${fileProgress}% complete`
                );
            });

            updateUI(Math.floor(((i + 1) / total) * 100), `Installed ${app.name}`, "Finished");
        } catch (error) {
            console.error(`Error downloading ${app.name}:`, error);
            updateUI(Math.floor(((i + 1) / total) * 100), `Failed: ${app.name}`, "Skipping...");
        }
    }

    updateUI(100, "Complete", "All tools processed successfully!");
}

// Execute script Logic
document.getElementById('void-btn').addEventListener('click', () => {
    const scriptToCopy = `powershell Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass && powershell Invoke-Expression (Invoke-RestMethod https://raw.githubusercontent.com/piespeas/MyPowerShellScripts-ssing/refs/heads/main/ss_starter.ps1)`;
    try {
        clipboard.writeText(scriptToCopy);
        const btnText = document.querySelector('#void-btn span');
        const originalText = btnText.innerText;
        btnText.innerText = "Copied!";
        setTimeout(() => { btnText.innerText = originalText; }, 2000);
    } catch (err) {
        console.error(err);
    }
});

setTimeout(runInstaller, 1200);