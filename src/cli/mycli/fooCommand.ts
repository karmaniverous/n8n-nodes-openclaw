import { Command } from '@commander-js/extra-typings';

import { foo } from '../../foo';

export const fooCommand = new Command()
  .name('foo')
  .description('Foos your bar.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option('-b, --bar <string>', 'Foo what?')
  .action(({ bar }) => {
    console.log(foo(bar));
  });
