# hourglass-cli

## Installation

Requires node 8 or greater.

```npm install -g @jrni/hourglass-cli```

## Options

Options may be passed with flags, however you will be prompted to enter any missing required
options.

The options will be stored in the project directory in ```.bbugrc```. This avoids the need to
re-enter options upon re-triggering commands for a given app project.

## Commands

### Install

Builds and installs an app package to the BookingBug engine. Run the command in the Jext app project
directory.

```hourglass-cli install [options]```

Options:

<table>
  <tr>
    <td>--email</td><td>Email address used to log into BookingBug</td>
  </tr>
  <tr>
    <td>--password</td><td>Password used to log into BookingBug</td>
  </tr>
  <tr>
    <td>--host</td><td>Destination host server</td>
  </tr>
  <tr>
    <td>--companyId</td><td>Destination company</td>
  </tr>
  <tr>
    <td>--port</td><td>HTTP port to use</td>
</table>

### Uninstall

Removes an app package from the BookingBug engine.

```hourglass-cli uninstall [options]```

Options:

<table>
  <tr>
    <td>--email</td><td>Email address used to log into BookingBug</td>
  </tr>
  <tr>
    <td>--password</td><td>Password used to log into BookingBug</td>
  </tr>
  <tr>
    <td>--host</td><td>Destination host server</td>
  </tr>
  <tr>
    <td>--companyId</td><td>Destination company</td>
  </tr>
  <tr>
    <td>--port</td><td>HTTP port to use</td>
</table>

### Tail

Display the script logs for an app package.

```hourglass-cli tail [options]```

Options:

<table>
  <tr>
    <td>--email</td><td>Email address used to log into BookingBug</td>
  </tr>
  <tr>
    <td>--password</td><td>Password used to log into BookingBug</td>
  </tr>
  <tr>
    <td>--host</td><td>Destination host server</td>
  </tr>
  <tr>
    <td>--companyId</td><td>Destination company</td>
  </tr>
  <tr>
    <td>--port</td><td>HTTP port to use</td>
</table>

