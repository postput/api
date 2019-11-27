import { expect } from 'chai';
import {describe, it} from 'mocha'

describe('First test',
    () => {
        it('should return true', () => {
            const result = true;
            expect(result).to.equal(true);
        });
    });