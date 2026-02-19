#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';

import { fooCommand } from './fooCommand';

const cli = new Command()
  .name('mycli')
  .description('My CLI tool')
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(fooCommand);

cli.parse();
