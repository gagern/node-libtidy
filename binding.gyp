{
    'targets': [
        {
            'target_name': '<(module_name)',
            'sources': [
                'src/node-libtidy.cc',
                'src/memory.cc',
                'src/opt.cc',
                'src/doc.cc',
                'src/worker.cc',
                'tidy-html5/src/access.c',
                'tidy-html5/src/attrs.c',
                'tidy-html5/src/istack.c',
                'tidy-html5/src/parser.c',
                'tidy-html5/src/tags.c',
                'tidy-html5/src/entities.c',
                'tidy-html5/src/lexer.c',
                'tidy-html5/src/pprint.c',
                'tidy-html5/src/charsets.c',
                'tidy-html5/src/clean.c',
                'tidy-html5/src/message.c',
                'tidy-html5/src/config.c',
                'tidy-html5/src/alloc.c',
                'tidy-html5/src/attrask.c',
                'tidy-html5/src/attrdict.c',
                'tidy-html5/src/attrget.c',
                'tidy-html5/src/buffio.c',
                'tidy-html5/src/fileio.c',
                'tidy-html5/src/streamio.c',
                'tidy-html5/src/tagask.c',
                'tidy-html5/src/tmbstr.c',
                'tidy-html5/src/utf8.c',
                'tidy-html5/src/tidylib.c',
                'tidy-html5/src/mappedio.c',
                'tidy-html5/src/gdoc.c',
                'tidy-html5/src/language.c',
            ],
            'include_dirs': [
                'tidy-html5/include',
                '<!(node -e "require(\'nan\')")'
            ],
            'defines': [
                '_REENTRANT',
                'HAVE_CONFIG_H',
                'LIBTIDY_VERSION="<!(node parse-version.js version)"',
                'RELEASE_DATE="<!(node parse-version.js date)"',
                'BUILD_SHARED_LIB',
                'BUILDING_SHARED_LIB',
            ],
            'configurations': {
                'Debug': {
                    'defines': [
                        'DEBUG',
                    ],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                            'RuntimeLibrary': 1, # rtMultiThreadedDebug
                        },
                    },
                },
                'Release': {
                    'defines': [
                        'NDEBUG',
                    ],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                            'RuntimeLibrary': 0, # rtMultiThreaded
                        },
                    },
                },
            },
            'conditions': [
                ['OS=="win"', {
                    'sources': [
                        'tidy-html5/src/sprtf.c',
                    ],
                    'defines': [
                        'NOMINMAX',
                        '_USE_MATH_DEFINES',
                        '_CRT_SECURE_NO_WARNINGS',
                        '_SCL_SECURE_NO_WARNINGS',
                        '__CRT_NONSTDC_NO_WARNINGS',
                    ]
                }, {
                    'cflags': [
                        '-Wno-missing-field-initializers',
                    ],
                }]
            ]
        },
        {
            'target_name': 'action_after_build',
            'type': 'none',
            'dependencies': [ '<(module_name)' ],
            'copies': [
                {
                    'files': [ '<(PRODUCT_DIR)/<(module_name).node' ],
                    'destination': '<(module_path)'
                }
            ]
        },
    ]
}
