{
    'targets': [
        {
            'target_name': 'tidy',
            'sources': [
                'src/node-libtidy.cc',
                'src/memory.cc',
                'src/opt.cc',
                'src/doc.cc',
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
                'tidy-html5/src/localize.c',
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
            ],
            'include_dirs': [
                'tidy-html5/include',
                '<!(node -e \'require("nan")\')'
            ],
            'defines': [
                '_REENTRANT',
                'HAVE_CONFIG_H',
                'SUPPORT_UTF16_ENCODINGS=1',
                'SUPPORT_ASIAN_ENCODINGS=1',
                'SUPPORT_ACCESSIBILITY_CHECKS=1',
                'LIBTIDY_VERSION="<!(node parse-version.js version)"',
                'RELEASE_DATE="<!(node parse-version.js date)"',
            ],
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
                        '__CRT_NONSTDC_NO_WARNINGS'
                    ]
                }, {
                    'cflags': [
                        '-Wno-missing-field-initializers'
                    ],
                }]
            ]
        }
    ]
}
