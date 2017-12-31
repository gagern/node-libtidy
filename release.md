# How to create a release

1. Clean tree: `git clean -idx`.
1. Rebuild library locally: `npm install`.
1. Run tests: `npm test`.
1. Examine commit history since last release to identify relevant changes.
1. Create a signed and annotated git tag: `git tag -s vX.Y.Z`.
   Include a short description of the relevant changes.
1. Publish it to GitHub: `git push origin tag vX.Y.Z`.
1. Wait for Travis and AppVeyor to build precompiled libraries for it.
   These should get uploaded to a release draft automatically.
1. Edit release draft on GitHub and publish it.
   Change name of release from vX.Y.Z to X.Y.Z.
   Include description of changes, possibly with improved Markdown formatting.
1. Publish release on NPM: `npm publish`
