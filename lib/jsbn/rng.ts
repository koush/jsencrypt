// Random number generator - requires a PRNG backend, e.g. prng4.js
import {Arcfour, prng_newstate, rng_psize} from "./prng4";

let rng_state:Arcfour;
let rng_pool:number[] = null;
let rng_pptr:number;

declare var globalThis:any;

// Initialize the pool with junk if needed.
if (rng_pool == null) {
  rng_pool = [];
  rng_pptr = 0;
  let t;
  if (globalThis.crypto && globalThis.crypto.getRandomValues) {
    // Extract entropy (2048 bits) from RNG if available
    const z = new Uint32Array(256);
    globalThis.crypto.getRandomValues(z);
    for (t = 0; t < z.length; ++t) {
        rng_pool[rng_pptr++] = z[t] & 255;
    }
  }

  // Use mouse events for entropy, if we do not have enough entropy by the time
  // we need it, entropy will be generated by Math.random.
  const onMouseMoveListener = function (ev:Event & {x:number; y:number; }) {
    this.count = this.count || 0;
    if (this.count >= 256 || rng_pptr >= rng_psize) {
      if (globalThis.removeEventListener) {
          globalThis.removeEventListener("mousemove", onMouseMoveListener, false);
      } else if ((globalThis as any).detachEvent) {
          (globalThis as any).detachEvent("onmousemove", onMouseMoveListener);
      }
      return;
    }
    try {
      const mouseCoordinates = ev.x + ev.y;
      rng_pool[rng_pptr++] = mouseCoordinates & 255;
      this.count += 1;
    } catch (e) {
      // Sometimes Firefox will deny permission to access event properties for some reason. Ignore.
    }
  };
  if (globalThis.addEventListener) {
      globalThis.addEventListener("mousemove", onMouseMoveListener, false);
  } else if ((globalThis as any).attachEvent) {
      (globalThis as any).attachEvent("onmousemove", onMouseMoveListener);
  }

}

function rng_get_byte() {
  if (rng_state == null) {
    rng_state = prng_newstate();
    // At this point, we may not have collected enough entropy.  If not, fall back to Math.random
    while (rng_pptr < rng_psize) {
      const random = Math.floor(65536 * Math.random());
      rng_pool[rng_pptr++] = random & 255;
    }
    rng_state.init(rng_pool);
    for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
        rng_pool[rng_pptr] = 0;
    }
    rng_pptr = 0;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}


export class SecureRandom {

  public nextBytes(ba:number[]) {
      for (let i = 0; i < ba.length; ++i) {
          ba[i] = rng_get_byte();
      }
  }
}
