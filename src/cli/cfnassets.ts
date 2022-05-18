#!/usr/bin/env node
import { Command } from 'commander';
import { addBuildCommand } from './build.js';

const program = new Command('deploy') as Command;

addBuildCommand(program);

await program.parseAsync();
