const readline = require('readline');

const createMemory = require('./create-memory');
const CPU = require('./cpu');
const instructions = require('./instructions');

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

// Register constants
const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

const cpu = new CPU(memory);

let i = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', () => {
    cpu.step();
    cpu.debugRegisters();
    cpu.debugMemory(cpu.getRegister('ip'));
    cpu.debugMemory(0x0100);
});

// Program 2: Jump if not equal

writableBytes[i++] = instructions.MOV_MEM_REG;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00; // 0x0100, former value at this position into R1
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x01; // 0x0001
writableBytes[i++] = R2;

writableBytes[i++] = instructions.ADD_REG_REG; // Add value from step 2 to former value in 0x0100
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.MOV_REG_MEM;
writableBytes[i++] = ACC;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00; // 0x0100

writableBytes[i++] = instructions.JMP_NOT_EQ; // Jump if value in accumulator is not equal to 0x0003
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x03; // 0x0003, value to check against
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x00; // 0x0000, start of the program

cpu.debugRegisters();
cpu.debugMemory(cpu.getRegister('ip'));
cpu.debugMemory(0x0100);