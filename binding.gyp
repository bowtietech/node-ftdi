{
  'targets': [
    {
      'target_name': 'ftdi',
      'sources':
      [
        './src/ftdi_device.cc',
	      './src/ftdi_driver.cc'
      ],
      'include_dirs+':
      [
        'src/',
         "<!(node -e \"require('nan')\")",
         'lib/',
         '/lib/amd64/'
      ],
      'conditions':
      [
        ['OS == "win"',
          {
                     "copies":
         [
            {
               'destination': '<(module_root_dir)/build/Release',
               'files': ['<(module_root_dir)/lib/amd64/ftd2xx.dll']
            }
         ],
            "variables": {
              "dll_files": [
                "<(module_root_dir)/build/Release/ftd2xx.dll"
              ]
            },
            'include_dirs+':
            [
              'lib/'
            ],
            'link_settings':
            {
                'libraries': [
                   '-l<(module_root_dir)/lib/amd64/ftd2xx.lib',
                  #  '-l<(module_root_dir)/build/Release/ftd2xx.lib',
                  # '-lftd2xx'
                  #  '-l<(module_root_dir)/lib/MPSSE/libMPSSE.lib'
                ]
          }
        }],
        ['OS != "win"',
          {
            'include_dirs+': [
              '/usr/local/include',
              'lib/MPSSE/',
            ],
            'ldflags': [
              '-Wl,-Map=output.map',
            ],
            'link_settings': {
              'libraries': [
                '-lftd2xx',
                '<(module_root_dir)/lib/MPSSE/libMPSSE.so'
              ]
            }
          }
        ]
      ],
    }
  ]
}
