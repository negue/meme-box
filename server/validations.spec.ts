import {objIsClip, objIsClipWithoutId} from "./validations";
import {expect} from 'chai';
import {describe} from 'mocha';
import {Clip} from "../projects/contracts/src/lib/types";
import {MediaType} from "../projects/contracts/src/lib/media.types";

describe('type validations', () => {

  it('should be a clip - without id' , () => {
    expect(objIsClipWithoutId({
      name: 'New Clip',
      path: 'someUrl',
      type: MediaType.Video,
      playLength: 1337
    } as Clip)).to.equal(true);
  });

  it('should be a clip' , () => {
    expect(objIsClip({
      name: 'New Clip',
      path: 'someUrl',
      type: MediaType.Video,
      playLength: 1337,
      id: 'some-guid'
    } as Clip)).to.equal(true);
  });

  it('should not be a clip' , () => {
    expect(objIsClip({})).to.equal(false);
  });

});
