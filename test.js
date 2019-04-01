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
];

// F(ref) = 10 MHz @ 7dBm into 50 ohm
// 


// N = 2556; = 0x9fc
// R = 1; = 0x01
// O = 6; = 0x06
let mSpiPll0Init = [
    0x10, // [Confirmed] Output on rising clock, no input
    0x0a, // [Confirmed] Length Low (Value = length - 1)
    0x00, // [Confirmed] Length High
    0x02, // [Confirmed] Addr 0 - Reg 1 (1 << 1)

    // Trigger Stat Pin on Flags 
    // | x | x | UNLOCK | ALCHI | ALCLO | LOCK | THI | TLO |
    // | 0 | 0 |   1    |   1   |   1   |  0   |  1  |  1  |
    0x3B, // Reg 1 Value - Trigger Stat Pin on Flags

    // System Control
    // | PDALL | PDPLL | PDVCO | PDOUT | PDREF0 | MTCAL | OMUTE | POR |
    // |   0   |   0   |   0   |   0   |    1   |   0   |   1   |  0  |
    0x0a, // Reg 2 Value - System Control
    
    // BD, R, & N Settings
    0x00, // [Check BD, R Confirmed] Reg 3 Value - BD[3:0] .. R[9:8]
    0x01, // [Confirmed] Reg 4 Value - R[7:0]
    0x09, // [Confirmed] Reg 5 Value - N[15:8]
    0xfc, // [Confirmed] Reg 6 Value - N[7:0]

    // VCO ALC and Calibration Programming
    // | ALCEN | ALCMON | ALCCAL | ALCULOK | x | x | CAL | LKEN |
    // |   0   |    1   |    1   |    0    | 0 | 0 |  1  |   1  |
    0x63, // Reg 7 Value - VCO ALC and Calibration Programming

    // Reference Input Settings and Output Divider Programming
    // 10 MHz Reference Clock
    // | BST | FILT[1:0] | RFO[1:0] | OD[2:1] |
    // |  0  |    1 1    |   1  1   |  1 1 0  |
    0x7e, // Reg 8 Value - Reference Input Settings and Output Divider Programming

    // Lock Detect and Charge Pump Current Programming
    // | LKWIN[1] | LKWIN[0] | LKCT[1] | LKCT[0] | CP[3] | CP[2] | CP[1] | CP[0] |
    // |     1    |     1    |    0    |    1    |   1   |   0   |   1   |   1   |
    0xDB, // Reg 9 Value - (Confirm Phase) Lock Detect and Charge Pump Current Programming

    //  Charge Pump Function Programming
    // | CPCHI | CPCLO | CPMID | CPINV | CPWIDE | CPRST | CPUP | CPDN |
    // |   1   |   1   |   0   |   0   |    0   |   0   |   0  |   0  |
    0xC0 // Reg A Value - [Confirmed] Charge Pump Function Programming
];

// N = 5267; = 0x1493
// R = 10; = 0x0A
// O = 1; = 0x01
let mSpiPll1Init = [
    0x10, // [Confirmed] Output on rising clock, no input
    0x0a, // [Confirmed] Length Low (Value = length - 1)
    0x00, // [Confirmed] Length High
    0x02, // [Confirmed] Addr 0 - Reg 2 (2 << 1)

    // Trigger Stat Pin on Flags 
    // | x | x | UNLOCK | ALCHI | ALCLO | LOCK | THI | TLO |
    // | 0 | 0 |   1    |   1   |   1   |  0   |  1  |  1  |
    0x3B, // Reg 1 Value - Trigger Stat Pin on Flags

    // System Control
    // | PDALL | PDPLL | PDVCO | PDOUT | PDREF0 | MTCAL | OMUTE | POR |
    // |   0   |   0   |   0   |   0   |    1   |   0   |   1   |  0  |
    0x0a, // Reg 2 Value - System Control


    // BD, R, & N Settings
    0x00, // [Check BD, R Confirmed] Reg 3 Value - BD[3:0] .. R[9:8]
    0x0a, // Reg 4 Value - R[7:0]
    0x14, // Reg 5 Value - N[15:8]
    0x93, // Reg 6 Value - N[7:0]

    // VCO ALC and Calibration Programming
    // | ALCEN | ALCMON | ALCCAL | ALCULOK | x | x | CAL | LKEN |
    // |   0   |    1   |    1   |    0    | 0 | 0 |  1  |   1  |
    0x63, // Reg 7 Value - VCO ALC and Calibration Programming

    // Reference Input Settings and Output Divider Programming
    // 10 MHz Reference Clock
    // | BST | FILT[1:0] | RFO[1:0] | OD[2:1] |
    // |  0  |    1 1    |   0  1   |  0 0 1  |
    0x7e, // Reg 8 Value - Reference Input Settings and Output Divider Programming

    // Lock Detect and Charge Pump Current Programming
    // | LKWIN[1] | LKWIN[0] | LKCT[1] | LKCT[0] | CP[3] | CP[2] | CP[1] | CP[0] |
    // |     1    |     1    |    0    |    1    |   1   |   0   |   1   |   1   |
    0xDB, // Reg 9 Value - (Confirm Phase) Lock Detect and Charge Pump Current Programming

    //  Charge Pump Function Programming
    // | CPCHI | CPCLO | CPMID | CPINV | CPWIDE | CPRST | CPUP | CPDN |
    // |   1   |   1   |   0   |   0   |    0   |   0   |   0  |   0  |
    0xC0 // Reg A Value - [Confirmed] Charge Pump Function Programming
];

let mSpiPllUnmute = [
    0x10, // Output on rising clock, no input
    0x01, // Length Low (Value = length - 1)
    0x00, // Length High
    0x06, // Addr 0 - Reg 2 (2 << 1)
    0x08, // Unmute PLL
];

let mSpiPllReadStat = [
    0x30, // Read/write
    0x01, // Length Low (Value = length - 1)
    0x00, // Length High
    0x00, // Addr 0 
    0x55  // Don't Care Data
]

// DWORD dwClockDivisor = 0x05DB;

// Device testing
console.log("Device Test:");
let device = null;

function csDisable(device) {
    device.write(mCsDisable, (err) => {
        // console.log(err);
    })
}
function csEnable(device) {
    device.write(mCsEnable, (err) => {
        // console.log(err);
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
        device = new ftdi.FtdiDevice(0); 

        device.on('error', function (err) {
            console.log('Device Error');
            console.log(err);
        });
    } catch (err) {
        console.log('No device connected');
        return;
    }

    // return;

    device.open({
            baudrate: 250000,
            databits: 8,
            stopbits: 1,
            flags: 0x1,
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
                csDisable(device);
                console.log('Received');
                console.log(data);

            });


            // return;

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
                device.write(mSpiPll0Init, function (err) {
                    console.log("Wrote PLL Config Message");
                    setTimeout(()=>{
                        csDisable(device);
                    }, 1);
                    if (err) {

                    } else {}
                });
            }, 1300);
            setTimeout(() => {
                csEnable(device);
                device.write(mSpiPllUnmute, function (err) {
                    console.log("Wrote PLL Unmute Message");
                    setTimeout(() => {
                        csDisable(device);
                    }, 1);
                    if (err) {

                    } else {}
                });
            }, 1400);

            setTimeout(() => {
                csEnable(device);
                device.write(mSpiPllReadStat, function (err) {
                    console.log("Request Read PLL Status Message (get in callback)");
                    setTimeout(() => {
                        // csDisable(device);
                    }, 10);
                    if (err) {

                    } else {}
                });
            }, 1500);

        });
});