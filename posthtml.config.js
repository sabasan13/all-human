module.exports = ({ file, options, env }) => {
    const plugins = [
        require('posthtml-include')({
            root: './src/html/',
        }),
        require('posthtml-expressions')({
            locals: {
                active: 'OK',
            },
        }),
    ]

    if (options && options.is_build) {
        plugins.push(
            require('posthtml-inline-assets')({
                cwd: `${process.cwd()}/public/`,
                transforms: {
                    image: false,
                    script: false,
                },
            })
        )

        plugins.push(
            require('posthtml-minify-classnames')({
                filter: /(waiting-animation|no-transition)/,
                genNameClass: 'genNameEmojiString',
                genNameId: false,
            })
        )

        plugins.push(require('htmlnano')({}))
    }

    return {
        plugins: plugins,
    }
}
