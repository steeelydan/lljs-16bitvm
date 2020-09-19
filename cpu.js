const createMemory = require('./create-memory');
const instructions = require('./instructions');

class CPU {
    constructor(memory) {
        this.memory = memory;

        this.registerNames = ['ip', 'acc', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];

        this.registers = createMemory(this.registerNames.length * 2);

        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;

            return map;
        }, {});
    }

    debugRegisters() {
        console.log('Registers:');
        this.registerNames.forEach((name) => {
            console.log(
                `${(name + ':').padEnd(4, ' ')} 0x${this.getRegister(name)
                    .toString(16)
                    .padStart(4, '0')}`
            );
        });

        console.log();
    }

    debugMemory(address) {
        if (address !== 0 && !address) {
            throw new Error('debugMemory: No address specified.');
        }

        const next8Bytes = Array.from({ length: 8 }, (_, i) => {
            return this.memory.getUint8(address + i);
        }).map((content) => `0x${content.toString(16).padStart(2, '0')}`);

        console.log(`Memory at 0x${address.toString(16).padStart(4, '0')}: ${next8Bytes.join(' ')}`);
        console.log();
    }

    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`getRegister: No such register '${name}'`);
        }

        return this.registers.getUint16(this.registerMap[name]);
    }

    setRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error(`getRegister: No such register '${name}'`);
        }

        return this.registers.setUint16(this.registerMap[name], value);
    }

    fetch8() {
        const nextInstructionAddress = this.getRegister('ip');
        const instruction = this.memory.getUint8(nextInstructionAddress);
        this.setRegister('ip', nextInstructionAddress + 1);

        return instruction;
    }

    fetch16() {
        const nextInstructionAddress = this.getRegister('ip');
        const instruction = this.memory.getUint16(nextInstructionAddress);
        this.setRegister('ip', nextInstructionAddress + 2);

        return instruction;
    }

    execute(instruction) {
        switch (instruction) {
            // Move literal value into register
            case instructions.MOV_LIT_REG: {
                const literal = this.fetch16();
                const register = (this.fetch8() % this.registerNames.length) * 2; // Make sure we get a useful value
                this.registers.setUint16(register, literal);

                return;
            }

            // Move register to register
            case instructions.MOV_REG_REG: {
                const registerFrom = (this.fetch8() % this.registerNames.length) * 2;
                const registerTo = (this.fetch8() % this.registerNames.length) * 2;
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);

                return;
            }

            // Move register to memory
            case instructions.MOV_REG_MEM: {
                const registerFrom = (this.fetch8() % this.registerNames.length) * 2;
                const address = this.fetch16();
                const value = this.registers.getUint16(registerFrom);
                this.memory.setUint16(address, value);

                return;
            }

            // Move memory to register
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = (this.fetch8() % this.registerNames.length) * 2;
                const value = this.memory.getUint16(address);
                this.registers.setUint16(registerTo, value);

                return;
            }

            // Add register value to register value
            case instructions.ADD_REG_REG: {
                const r1 = this.fetch8();
                const r2 = this.fetch8();
                const registerValue1 = this.registers.getUint16(r1 * 2);
                const registerValue2 = this.registers.getUint16(r2 * 2);

                this.setRegister('acc', registerValue1 + registerValue2);

                return;
            }

            // Jump if not equal
            case instructions.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value !== this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }
        }
    }

    step() {
        const instruction = this.fetch8();

        return this.execute(instruction);
    }
}

module.exports = CPU;
