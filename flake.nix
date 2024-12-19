{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem(system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
        {
          devShells.default = pkgs.mkShell {
            MADNESS_ALLOW_LDD = "1";
            nativeBuildInputs = with pkgs; [
              nodejs_22
              nodePackages.pnpm
              nodePackages.typescript
              nodePackages.typescript-language-server
            ];
          };
        }
    );
}
