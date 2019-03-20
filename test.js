var ftdi = require('./index');


var state = 0;

const STATE_LOOPBACK_TEST = 0;
const STATE_LOOPBACK_DISABLED = 1;


let mSpiConfig_HS = [
    0x8A, // Use 60MHz master clock (disable divide by 5)
    0x97, // Turn off adaptive clocking
    0x8D, // Disable 3 phase clocking
]

let mSpiConfig_CLK = [
    0x86,
    0xDB,
    0x05
]
let mSpiConfig_GPIO_0 = [
    0x80, // Select low data bits
    0x08, // Set the initial state
    0x0B // Set the directionality
]
let mSpiConfig_GPIO_1 = [
    0x82, // Select high data bits
    0x00, // Set the initial state
    0x00 // Set the directionality
]

let mCsEnable = [
    0x80,
    0x00,
    0x0b
];

let mCsDisable = [
    0x80,
    0x08,
    0x0b
]

let mSpiTestMessage = [
    0x10, // Output on rising clock, no input
    // (Length - 1)
    0x03, // Length Low
    0x00, // Length High
    0xA5, // Data 0
    0xCC, // Data 1
    0x55,
    0x55
]

// DWORD dwClockDivisor = 0x05DB;

// Device testing
console.log("Device Test:");
let device = null;

function csDisable(device) {
    device.write(mCsDisable, (err) => {
        console.log(err);
    })
}
function csEnable(device) {
    device.write(mCsEnable, (err) => {
        console.log(err);
    })
}


ftdi.find(0x6014, 0x0403, function (err, devices, test) {
    // ftdi.find(12, 12, function (err, devices, test) {
    // ftdi.find(0x27f4, 0x0203, function (err, devices, test) {
    console.log("FTDI Devices: ");
    console.log(devices);
    console.log("FTDI Error: ");
    console.log(err);
    console.log("FTDI Test: ");
    console.log(test);


    try {
        device = new ftdi.FtdiDevice(0); // index in list function


        device.on('error', function (err) {
            console.log('Device Error');
            console.log(err);
        });
    } catch (err) {
        console.log('No device connected');
        return;
    }



    device.open({
            baudrate: 250000,
            databits: 8,
            stopbits: 1,
            parity: 'none',
            bitmode: 'mpsse',
            bitmask: 0x0
        },
        function (err) {
            if (err) {
                console.log('Open Error');
                console.log(err);
            }

            device.on('data', function (data) {
                console.log('Received');
                console.log(data);

                switch (state) {
                    case STATE_LOOPBACK_TEST:
                        if (data[0] == 0xfa && data[1] == CMD_DISABLE_LOOPBACK) {
                            +state++;
                            device.write([CMD_DISABLE_LOOPBACK], function (err) {
                                // setTimeout(()=>{
                                //     device.write([CMD_DISABLE_LOOPBACK], function (err) {});},500);
                                // return;
                                console.log("Loopback worked")
                                if (err) {
                                    console.log(err);
                                } else {
                                    // device.bitMode([
                                    //         0x0,
                                    //         0x0
                                    //     ],
                                    //     function (err) {
                                    //         console.log(err);
                                    //         return;
                                    setTimeout(() => {
                                        console.log("Sending GPIO Config");
                                        console.log(device);
                                        device.write(mSpiConfig_GPIO_0, (err) => {
                                            console.log("GPIO Config Sent");
                                            // setTimeout(() => {

                                            //     device.open({
                                            //             baudrate: 250000,
                                            //             databits: 8,
                                            //             stopbits: 1,
                                            //             parity: 'none',
                                            //             bitmode: 'mpsse',
                                            //             bitmask: 0x0
                                            //         },
                                            //         function (err) {
                                            setTimeout(() => {
                                                console.log("Trying again");
                                                console.log(device);
                                                device.write(mSpiTestMessage, (err) => {
                                                    console.log("Test Message Sent");
                                                });
                                            }, 1000);
                                            //         });
                                            // }, 1000);
                                        });
                                    }, 1000);
                                    // });
                                }
                            });
                        }
                        break;

                    case STATE_LOOPBACK_DISABLED:

                        break;

                    default:
                        break;
                }



            });

            // Initialize MPSSE loopback for testing
            const CMD_READBACK_TEST = 0xAB;
            const CMD_DISABLE_LOOPBACK = 0x85;
            setTimeout(() => {
                device.write([CMD_DISABLE_LOOPBACK], function (err) {

                    console.log("Disabled Loopback");
                    if (err) {

                    } else {}
                });
            }, 500);





            setTimeout(() => {
                device.write(mSpiConfig_HS, function (err) {
                    console.log("Wrote HS Clock Config");
                    if (err) {

                    } else {}
                });
            }, 700);
            setTimeout(() => {
                device.write(mSpiConfig_CLK, function (err) {
                    console.log("Wrote Clock Config");
                    if (err) {

                    } else {}
                });
            }, 800);
            setTimeout(() => {
                device.write(mSpiConfig_GPIO_0, function (err) {
                    console.log("Wrote GPIO Config 0");
                    if (err) {

                    } else {}
                });
            }, 1100);
            setTimeout(() => {
                device.write(mSpiConfig_GPIO_1, function (err) {
                    console.log("Wrote GPIO Config 1");
                    if (err) {

                    } else {}
                });
            }, 1200);
            setTimeout(() => {
                csEnable(device);
                device.write(mSpiTestMessage, function (err) {
                    console.log("Wrote SPI Test Message");
                    csDisable(device);
                    if (err) {

                    } else {}
                });
            }, 1200);


        });
});