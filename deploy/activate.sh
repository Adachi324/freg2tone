#!/usr/bin/env bash
set -euo pipefail
version=${1:?release SHA required}
[[ "$version" =~ ^[a-f0-9]{40}$ ]] || exit 2
root=/srv/fret2tone
exec 9>"$root/deploy.lock"
flock 9
release="$root/releases/$version"
mkdir -p "$release"
tar -xzf "$root/incoming/$version.tar.gz" -C "$release" --no-same-owner
for page in index.html lesson-1/index.html explore/index.html wiki/index.html; do
  test -s "$release/$page"
done
printf '%s\n' "$version" > "$release/version.txt"
previous=$(readlink "$root/current" || true)
ln -s "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if ! curl -fsS --retry 3 https://43.142.118.254/music/version.txt | grep -qx "$version"; then
  if [[ -n "$previous" ]]; then
    ln -s "$previous" "$root/current.rollback"
    mv -Tf "$root/current.rollback" "$root/current"
  fi
  exit 1
fi
rm "$root/incoming/$version.tar.gz"
printf 'Activated %s\n' "$version"
