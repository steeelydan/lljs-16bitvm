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

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x12; // Ox1234
writableBytes[i++] = 0x34;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0xab; // OxABCD
writableBytes[i++] = 0xcd;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.ADD_REG_REG;
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.MOV_REG_MEM;
writableBytes[i++] = ACC;
writableBytes[i++] = 0x01; // 0x0100
writableBytes[i++] = 0x00;

cpu.debugRegisters();
cpu.debugMemory(cpu.getRegister('ip'));
cpu.debugMemory(0x0100);

cpu.step();
cpu.debugRegisters();
cpu.debugMemory(cpu.getRegister('ip'));
cpu.debugMemory(0x0100);

cpu.step();
cpu.debugRegisters();
cpu.debugMemory(cpu.getRegister('ip'));
cpu.debugMemory(0x0100);

cpu.step();
cpu.debugRegisters();
cpu.debugMemory(cpu.getRegister('ip'));
cpu.debugMemory(0x0100);

cpu.step();
cpu.debugRegisters();
cpu.debugMemory(cpu.getRegister('ip'));
cpu.debugMemory(0x0100);