# SUF browser compatibility

Reviewed: 16 October 2026.

Target assumed for this review: current stable Chrome, Edge, Firefox and Safari, including current iOS Safari and Android Chrome. This is a support-data and source-code review, not a completed real-device test matrix. The team should agree on exact minimum browser versions before release. Internet Explorer and Opera Mini are outside this assumed target.

Can I Use reports browser support; it does not approve code or check school project rules. React and Vite do not need replacing based on this review.

| Feature used in SUF | Review and action | Source |
| --- | --- | --- |
| CSS Grid | Supported in target browsers; keep layout. | https://caniuse.com/css-grid |
| Flexbox gap | Supported in target browsers; older Safari before 14.1 and iOS before 14.5 lack support. | https://caniuse.com/flexbox-gap |
| clamp() heading size | Supported in target browsers; added fixed-size fallback. | https://caniuse.com/css-math-functions |
| Header backdrop blur | Supported in target browsers; added -webkit-backdrop-filter for older Safari. Existing background remains if blur is unsupported. | https://caniuse.com/css-backdrop-filter |
| Keyboard focus-visible | Supported in target browsers; added focus fallback and summary focus styling. | https://caniuse.com/css-focus-visible |
| details / summary post menu | Supported in target browsers. | https://caniuse.com/details |
| Logo CSS filters and blend mode | Supported in target browsers. | https://caniuse.com/css-filters and https://caniuse.com/css-mixblendmode |
| Clipboard writeText | Supported in target browsers, but requires a secure context and can be denied. Added capability check, error handling and selectable manual-copy field. Deploy using HTTPS; localhost is suitable for development. | https://caniuse.com/mdn-api_clipboard_writetext and https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText |
| localStorage | Access can throw when storage is blocked. Added guarded reads/writes so pages keep working; saved posts show a notice if persistence fails. | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |

## Before release

Run login/signup validation, theme switching, logo rendering, post menus, save/unsave, pagination, comments and code copying in each target browser. Also test clipboard denial and blocked storage. A successful production build checks compilation, not full browser behavior.
