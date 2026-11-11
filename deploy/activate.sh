#!/usr/bin/env bash
set -euo pipefail
version=${1:?release SHA required}
[[ "$version" =~ ^[a-f0-9]{40}$ ]] || exit 2
root=/srv/fret2tone
exec 9>"$root/deploy.lock"
flock -w 120 9
release="$root/releases/$version"
staging=$(mktemp -d "$root/releases/.staging.XXXXXX")
trap 'rm -rf "$staging"' EXIT
tar -xzf "$root/incoming/$version.tar.gz" -C "$staging" --no-same-owner
for page in index.html home/index.html lesson-1/index.html explore/index.html wiki/index.html; do
  test -s "$staging/$page"
done
printf '%s\n' "$version" > "$staging/version.txt"
if [[ -d "$release" ]]; then
  # A published SHA is immutable; reruns reuse its verified contents.
  test "$(cat "$release/version.txt")" = "$version"
else
  mv "$staging" "$release"
fi
previous=$(readlink "$root/current" || true)
ln -s "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if ! curl -fsS --connect-timeout 10 --max-time 30 --retry 2 https://43.142.118.254/music/version.txt | grep -qx "$version"; then
  if [[ -n "$previous" ]]; then
    ln -s "$previous" "$root/current.rollback"
    mv -Tf "$root/current.rollback" "$root/current"
  else
    rm "$root/current"
  fi
  exit 1
fi
rm "$root/incoming/$version.tar.gz"
printf 'Activated %s\n' "$version"
