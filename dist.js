const fs = require('fs-extra');

(async function() {
    await fs.remove("./dist");
    const manifest = await fs.readJson("./manifest.json");
    const dest = `./dist/blog-skipper-${manifest.version}`;
    async function copyToDest(src) {
        await fs.copy("./" + src, dest + "/" + src);
    }

    await fs.ensureDir(dest);
    await copyToDest("icons");
    await copyToDest("options");
    await copyToDest("background.js");
    await copyToDest("content.js");
    await copyToDest("core.js");
    await copyToDest("manifest.json");
    await copyToDest("settings.js");
    await copyToDest("settings.json");
})();
