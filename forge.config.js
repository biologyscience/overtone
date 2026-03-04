module.exports = {
    packagerConfig: {
        ignore: (path) =>
        {
            if (path.includes('node_modules')) return false;

            if (path.includes('.git')) return true;
            if (path.includes('.github')) return true;

            if (path.includes('electron/appdata/'))
            {
                if (path.includes('eqs.json')) return false;
                return true;
            }

            if (path.includes('guides')) return true;
            if (path.includes('out')) return true;

            if (path.includes('react/'))
            {
                if (path.includes('dist')) return false;
                return true;
            }

            if (path.includes('.gitignore')) return true;
            if (path.includes('forge.config.js')) return true;
            if (path.includes('package-lock.json')) return true;

            return false;
        }
    },
    makers: [
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
        },
        // {
        //     name: '@electron-forge/maker-deb',
        //     platforms: ['linux'],
        // },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'linux', 'win32'],
        }
    ]
}