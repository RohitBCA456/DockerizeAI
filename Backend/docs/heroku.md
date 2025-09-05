

# Source: https://devcenter.heroku.com/articles/getting-started-with-nodejs

[Skip Navigation](#skip-link)

Show nav

 [![Heroku Dev Center](/assets/logo-ab9bf4e494ce3cf9732243e7951a5ff2d9112461ed28479bdd12b5b3dc84b209.svg) Dev Center](/)

*   [Get Started](/start)
*   [Documentation](/categories/reference)
*   [Changelog](/changelog)
*   [Search](/search)

 [![Heroku Dev Center](/assets/logo-ab9bf4e494ce3cf9732243e7951a5ff2d9112461ed28479bdd12b5b3dc84b209.svg) Dev Center](/)

*   [Get Started](/start)
    *   [Node.js](/articles/getting-started-with-nodejs)
    *   [Ruby on Rails](/articles/getting-started-with-rails6)
    *   [Ruby](/articles/getting-started-with-ruby)
    *   [Python](/articles/getting-started-with-python)
    *   [Java](/articles/getting-started-with-java)
    *   [PHP](/articles/getting-started-with-php)
    *   [Go](/articles/getting-started-with-go)
    *   [Scala](/articles/getting-started-with-scala)
    *   [Clojure](/articles/getting-started-with-clojure)
    *   [.NET](/articles/getting-started-with-dotnet)
*   [Documentation](/categories/reference)
*   [Changelog](/changelog)
*   [More](#)
    
    Additional Resources
    
    *   [Home](https://www.heroku.com/)
    *   [Elements](https://elements.heroku.com/)
    *   [Products](https://www.heroku.com/products)
    *   [Pricing](https://www.heroku.com/pricing)
    *   [Careers](https://www.heroku.com/careers)
    *   [Help](https://help.heroku.com/)
    *   [Status](https://status.heroku.com/)
    *   [Events](https://www.heroku.com/events)
    *   [Podcasts](https://www.heroku.com/podcasts)
    *   [Compliance Center](https://www.heroku.com/compliance)
    
    Heroku Blog
    
    ### [Heroku Blog](https://blog.heroku.com)
    
    Find out what's new with Heroku on our blog.
    
    [Visit Blog](https://blog.heroku.com)
    

*   
*   [Log in](/login?back_to=%2Farticles%2Fgetting-started-with-nodejs) or [Sign up](https://signup.heroku.com)

Getting Started on Heroku with Node.js
======================================

Introduction
------------

Complete this tutorial to deploy a sample Node.js app to [Cedar](https://devcenter.heroku.com/articles/generations#cedar), the legacy generation of the Heroku platform. To deploy the app to the [Fir](https://devcenter.heroku.com/articles/generations#fir) generation, only available to [Heroku Private Spaces](https://devcenter.heroku.com/articles/private-spaces), follow this [guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs-fir) instead.

The tutorial assumes that you have:

*   A [verified Heroku Account](https://devcenter.heroku.com/articles/account-verification)
*   [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/package/npm) installed locally
*   An [Eco dynos plan](https://devcenter.heroku.com/articles/eco-dyno-hours) subscription (recommended)

Using dynos to complete this tutorial counts towards your usage. To complete this tutorial, we recommend using our [low-cost plans](https://blog.heroku.com/new-low-cost-plans). Eligible students can apply for platform credits through our new [Heroku for GitHub Students program](https://blog.heroku.com/github-student-developer-program).

Set Up
------

Install the [Heroku Command Line Interface](https://devcenter.heroku.com/articles/heroku-cli) (CLI). Use the CLI to manage and scale your app, provision add-ons, view your logs, and run your app locally.

The Heroku CLI requires [Git](https://git-scm.com/), the popular version control system. If you don’t already have Git installed, complete the following before proceeding:

*   [Git installation](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
*   [First-time Git setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)

Download and run the installer for your platform:

![apple logo](/images/cli-apple-logo.svg)macOS

[Install Homebrew](https://brew.sh/) and run:

    $ brew install heroku/brew/heroku

![windows logo](/images/cli-windows-logo.svg)Windows

Download the appropriate installer for your Windows installation:

[64-bit installer](https://cli-assets.heroku.com/channels/stable/heroku-x64.exe)

[32-bit installer](https://cli-assets.heroku.com/channels/stable/heroku-x86.exe)

You can find more installation options for the Heroku CLI [here](https://devcenter.heroku.com/articles/heroku-cli).

After installation, you can use the `heroku` command from your command shell.

On Windows, start the Command Prompt (cmd.exe) or Powershell to access the command shell.

To log in to the Heroku CLI, use the `heroku login` command:

    $ heroku login
    heroku: Press any key to open up the browser to login or q to exit:
    Opening browser to https://cli-auth.heroku.com/auth/cli/browser/***
    heroku: Waiting for login...
    Logging in... done
    Logged in as me@example.com
    

This command opens your web browser to the Heroku login page. If your browser is already logged in to Heroku, click the **`Log In`** button on the page.

This authentication is required for the `heroku` and `git` commands to work correctly.

If you have any problems installing or using the Heroku CLI, see the main [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) article for advice and troubleshooting steps.

If you’re behind a firewall that uses a proxy to connect with external HTTP/HTTPS services, [set the `HTTP_PROXY` or `HTTPS_PROXY` environment variables](https://devcenter.heroku.com/articles/using-the-cli#using-an-http-proxy) in your local development environment before running the `heroku` command.

Before you continue, check that you have the prerequisites installed properly. Type each command below, and make sure that each one displays the version that you installed. (Your versions can be different from the example.) If no version is returned, install the prerequisites.

To declare app dependencies and subsequent steps, you must complete this local setup.

This tutorial works for any version of Node greater than 18.

    $ node --version
    v22.11.0
    

`npm` is installed with Node, so check that it’s there. If you don’t have it, install a more recent version of Node.

    $ npm --version
    10.8.1
    

Now check that you have `git` installed. If not, [install it](https://git-scm.com/downloads), and test again.

    $ git --version
    git version 2.42.0
    

Prepare the App
---------------

In this step, you prepare a sample application that’s ready to be deployed to Heroku.

If you’re new to Heroku, we recommend that you complete this tutorial using the Heroku-provided sample application.

However, if you have an existing application that you want to deploy instead, read [this article](https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment) to learn how to prepare it for Heroku deployment.

To clone a local version of the sample application that you can then deploy to Heroku, execute these commands in your local command shell or terminal.

    $ git clone https://github.com/heroku/nodejs-getting-started.git
    $ cd nodejs-getting-started
    

You now have a functioning Git repository that contains a simple application and a `package.json` file, which Node’s dependency manager uses.

Deploy the app
--------------

In this step, you deploy the app to Heroku.

Using dynos to complete this tutorial counts towards your usage. To control costs, [Delete your app](https://devcenter.heroku.com/articles/heroku-cli-commands#heroku-apps-destroy) as soon as you‘re done.

By default, apps use Eco dynos if you’re subscribed to Eco. Otherwise, it defaults to Basic dynos. If you plan to deploy many small apps to Heroku, we recommend the Eco dynos plan, which is shared across all Eco dynos in your account. Learn more [here](https://blog.heroku.com/new-low-cost-plans). Eligible students can apply for platform credits through our [Heroku for GitHub Students program](https://blog.heroku.com/github-student-developer-program).

Create an app on Heroku, which prepares Heroku to receive your source code.

    $ heroku create
    Creating app... done, ⬢ shrouded-anchorage-35377
    https://shrouded-anchorage-35377.herokuapp.com/ | https://git.heroku.com/shrouded-anchorage-35377.git
    

When you create an app, you also create a Git remote called `heroku`. It’s associated with your local Git repository.

Heroku generates a random name for your app, in this case `shrouded-anchorage-35377`. Or you can pass a parameter to specify your own app name.

Deploy your code.

    $ git push heroku main
    Enumerating objects: 554, done.
    Counting objects: 100% (554/554), done.
    Delta compression using up to 20 threads
    Compressing objects: 100% (412/412), done.
    Writing objects: 100% (554/554), 248.74 KiB | 124.37 MiB/s, done.
    Total 554 (delta 109), reused 548 (delta 106), pack-reused 0
    remote: Compressing source files... done.
    remote: Building source:
    remote:
    remote: -----> Building on the Heroku-22 stack
    remote: -----> Determining which buildpack to use for this app
    remote: -----> Node.js app detected
    remote:
    remote: -----> Creating runtime environment
    remote:
    remote:        NPM_CONFIG_LOGLEVEL=error
    remote:        NODE_VERBOSE=false
    remote:        NODE_ENV=production
    remote:        NODE_MODULES_CACHE=true
    remote:
    remote: -----> Installing binaries
    remote:        engines.node (package.json):  22.x
    remote:        engines.npm (package.json):   unspecified (use default)
    remote:
    remote:        Resolving node version 22.x...
    remote:        Downloading and installing node 22.11.0...
    remote:        Using default npm version: 10.8.1
    remote:
    remote: -----> Installing dependencies
    remote:        Installing node modules (package.json)
    remote:
    remote:        added 160 packages, and audited 161 packages in 4s
    remote:
    remote:        64 packages are looking for funding
    remote:          run `npm fund` for details
    remote:
    remote:        found 0 vulnerabilities
    remote:
    remote: -----> Build
    remote:
    remote: -----> Caching build
    remote:        - node_modules
    remote:
    remote: -----> Pruning devDependencies
    remote:
    remote:        up to date, audited 74 packages in 450ms
    remote:
    remote:        9 packages are looking for funding
    remote:          run `npm fund` for details
    remote:
    remote:        found 0 vulnerabilities
    remote:
    remote: -----> Build succeeded!
    remote: -----> Discovering process types
    remote:        Procfile declares types -> web
    remote:
    remote: -----> Compressing...
    remote:        Done: 43.4M
    remote: -----> Launching...
    remote:        Released v3
    remote:        https://shrouded-anchorage-35377.herokuapp.com/ deployed to Heroku
    remote:
    remote: Verifying deploy... done.
    To https://git.heroku.com/shrouded-anchorage-35377.git
     * [new branch]      main -> main
    

Ensure that at least one instance of the app is running.

    $ heroku ps:scale web=1
    

Visit the app at the URL generated by its app name. As a shortcut, you can open the website.

    $ heroku open
    

View Logs
---------

Heroku treats logs as streams of time-ordered events aggregated from the output streams of all your app and Heroku components, providing a single channel for all of the events.

View information about your running app using one of the [logging commands](https://devcenter.heroku.com/articles/logging), `heroku logs --tail`:

    $ heroku logs --tail
    2023-03-02T19:56:09.671017+00:00 heroku[web.1]: Starting process with command `npm start`
    2023-03-02T19:56:12.617099+00:00 app[web.1]:
    2023-03-02T19:56:12.617126+00:00 app[web.1]: > nodejs-getting-started@0.3.0 start
    2023-03-02T19:56:12.617127+00:00 app[web.1]: > node index.js
    2023-03-02T19:56:12.617127+00:00 app[web.1]:
    2023-03-02T19:56:12.738203+00:00 app[web.1]: Listening on 16832
    2023-03-02T19:56:13.217147+00:00 heroku[web.1]: State changed from starting to up
    

Visit your application in the browser again, and you see another log message generated.

To stop streaming the logs, press `Control+C`.

Define a Procfile
-----------------

Use a [Procfile](https://devcenter.heroku.com/articles/procfile), which is a text file in the root directory of your application, to explicitly declare what command executes to start your app.

The `Procfile` in the example app you deployed looks like:

    web: npm start
    

The name `web` is important because it declares that this single process type attaches to Heroku’s [HTTP routing](https://devcenter.heroku.com/articles/http-routing) stack and receives web traffic when deployed. This command uses the `start` script specified in the `package.json`.

Procfiles can contain additional process types. For example, you can declare one for a background worker process that processes items off of a queue.

Scale the App
-------------

Right now, your app runs on a single web [dyno](https://devcenter.heroku.com/articles/dynos). Think of a dyno as a lightweight container that runs the command specified in the Procfile.

You can check how many dynos are running using the `ps` command.

    $ heroku ps
    === web (Eco): npm start (1)
    web.1: up 2023/03/02 15:56:13 -0400 (~ 6m ago)
    

By default, your app deploys on an Eco dyno. If they don’t receive any traffic, Eco dynos sleep after 30 minutes of inactivity. Upon waking, expect a delay of a few seconds for the first request. Subsequent requests perform normally. Eco dynos also consume from a monthly, account-level quota of [Eco dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours). As long as the quota isn’t exhausted, all Eco apps can continue to run.

To avoid dyno sleeping, you can upgrade to a Basic or Professional dyno type as described in the [Dyno Types](https://devcenter.heroku.com/articles/dyno-types) article. For example, if you migrate your app to a professional dyno, you can scale it by running a command that tells Heroku to execute a specific number of dynos, each running your web process type.

Scaling an application on Heroku is equivalent to changing the number of dynos running. Scale the number of web dynos to zero.

    $ heroku ps:scale web=0
    

Access the app again by hitting refresh on the web tab, or `heroku open` to open it in a web tab. You get an error message because you no longer have any web dynos available to serve requests.

Scale it up again.

    $ heroku ps:scale web=1
    

Declare App Dependencies
------------------------

Heroku recognizes an app as Node.js from a `package.json` file in the root directory. For your own apps, you can create one by running `npm init --yes`.

The demo app that you deployed already has a `package.json` that looks like:

    {
      "name": "nodejs-getting-started",
      "version": "0.3.0",
      ...
      "engines": {
        "node": "22.x"
      },
      "dependencies": {
        "ejs": "^3.1.5",
        "express": "^4.15.2"
      },
      ...
    }
    

The `package.json` file determines the version of Node.js to run your application on Heroku and the dependencies to install with your application.

Run this command in your local directory to install the dependencies, preparing your system to run the app locally.

    $ npm install
    added 160 packages in 6s
    

After installation, a `package-lock.json` file is generated when `npm install` is run. Make sure to check this into Git. When subsequent dependencies are added, npm makes changes to this file, so make sure to add those changes to Git too.

When an app is deployed, Heroku reads the `package.json` to install the appropriate node version and the `package-lock.json` to install the dependencies.

Run the App Locally
-------------------

Start your application locally using the `heroku local` command, which installed as part of the Heroku CLI.

    $ heroku local web --port 5006
    [OKAY] Loaded ENV .env File as KEY=VALUE Format
    4:09:49 p.m. web.1 |  > nodejs-getting-started@0.3.0 start
    4:09:49 p.m. web.1 |  > node index.js
    4:09:49 p.m. web.1 |  Listening on 5006
    

Just like Heroku, `heroku local` examines the Procfile to determine what to run.

Open [http://localhost:5006](http://localhost:5006) with your web browser to see your app running locally.

To stop the app from running locally, in the CLI, press `Ctrl`+`C` to exit.

Push Local Changes
------------------

In this step, you learn how to propagate a local change to the application through to Heroku. As an example, you modify the application to add an additional dependency and the code to use it.

Begin by adding a dependency for `cool-ascii-faces` in `package.json`. Run this command.

    $ npm install cool-ascii-faces
    added 11 packages in 2s
    

Modify `index.js` so that it `requires` this module at the start. Also add a new route (`/cool`) that uses it. You want the final code to look like:

    const express = require('express')
    const path = require('path')
    const cool = require('cool-ascii-faces')
    
    const port = process.env.PORT || 5006
    
    const app = express()
    
    app.use(express.static(path.join(__dirname, 'public')))
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    
    app.get('/', (req, res) => {
      console.log(`Rendering 'pages/index' for route '/'`)
      res.render('pages/index')
    })
    
    app.get('/cool', (req, res) => {
      console.log(`Rendering a cool ascii face for route '/cool'`)
      res.send(cool())
    })
    
    const server = app.listen(port, () => {
      console.log(`Listening on ${port}`)
    })
    
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: gracefully shutting down')
      if (server) {
        server.close(() => {
          console.log('HTTP server closed')
        })
      }
    })
    

Test locally.

    $ npm install
    $ heroku local --port 5006
    

When you visit your application at [http://localhost:5006/cool](http://localhost:5006/cool), the sample application shows you cute faces on each refresh: `( ⚆ _ ⚆ )`.

Deploy. Almost every deploy to Heroku follows this same pattern. First, add the modified files to the local Git repository.

    $ git add .
    

Commit the changes to the repository.

    $ git commit -m "Add cool face API"
    

Deploy, just as you did previously.

    $ git push heroku main
    

Check that everything works.

    $ heroku open cool
    

If everything is in working order, you see another face.

Provision Add-Ons
-----------------

Add-ons are third-party cloud services that provide out-of-the-box additional services for your application, from persistence through logging to monitoring and more.

By default, Heroku stores 1,500 lines of logs from your application. However, it makes the full log stream available as a service. Several add-on providers have logging services that provide things such as log persistence, search, and email and SMS alerts.

In this step, you provision one of these logging add-ons, Papertrail.

Provision the [papertrail](https://devcenter.heroku.com/articles/papertrail) logging add-on.

    $ heroku addons:create papertrail
    Creating papertrail on ⬢ shrouded-anchorage-35377... free
    Welcome to Papertrail. Questions and ideas are welcome (technicalsupport@solarwinds.com). Happy logging!
    Created papertrail-fluffy-46630 as PAPERTRAIL_API_TOKEN
    Use heroku addons:docs papertrail to view documentation
    

The add-on is now deployed and configured for your application. You can list add-ons for your app.

    $ heroku addons
    

To see this particular add-on in action, visit your application’s Heroku URL a few times. Each visit generates more log messages, which route to the papertrail add-on. Visit the papertrail console to see the log messages.

    $ heroku addons:open papertrail
    

Your browser opens a Papertrail web console showing the latest log events. You can search and set up alerts.

![Screenshot of console](https://devcenter1.assets.heroku.com/article-images/2105-imported-1443570562-2105-imported-1443555038-pap-1.png)

Start a Console
---------------

To get a feel for how dynos work, you can create another one-off dyno and run the `bash` command, which opens a shell on that dyno. You can then execute commands there. Each dyno has its own ephemeral filespace, populated with your app and its dependencies. When the command completes, in this case `bash`, the dyno is removed.

    $ heroku run bash
    Running bash on ⬢ shrouded-anchorage-35377... up, run.1662 (Eco)
    ~ $ ls
    Procfile  README.md  app.json  index.js  node_modules  package-lock.json  package.json  public  test.js  views
    ~ $ exit
    exit
    

If you receive `Error connecting to process`, try [configuring your firewall](https://devcenter.heroku.com/articles/troubleshooting-one-off-dynos-awaiting-process-timeout-issues).

To exit the shell and terminate the dyno, type `exit`.

Define Config Vars
------------------

With Heroku, you can externalize configuration, storing data such as encryption keys or external resource addresses in [config vars](https://devcenter.heroku.com/articles/config-vars).

At runtime, config vars are exposed as environment variables to the application. For example, lets modify `index.js` to introduce a new route, `/times`, that repeats an action depending on the value of the `TIMES` environment variable. Copy the following into `index.js`:

    const express = require('express')
    const path = require('path')
    const cool = require('cool-ascii-faces')
    
    const port = process.env.PORT || 5006
    
    const app = express()
    
    app.use(express.static(path.join(__dirname, 'public')))
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    
    app.get('/', (req, res) => {
      console.log(`Rendering 'pages/index' for route '/'`)
      res.render('pages/index')
    })
    
    app.get('/cool', (req, res) => {
      console.log(`Rendering a cool ascii face for route '/cool'`)
      res.send(cool())
    })
    
    app.get('/times', (req, res) => {
      const times = process.env.TIMES || 5
      console.log(`Rendering a count from 1 to ${times} for route '/times'`)
      let result = ''
      for (let i = 1; i <= times; i++) {
        result += i + ' '
      }
      res.send(result)
    })
    
    const server = app.listen(port, () => {
      console.log(`Listening on ${port}`)
    })
    
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: gracefully shutting down')
      if (server) {
        server.close(() => {
          console.log('HTTP server closed')
        })
      }
    })
    

`heroku local` automatically sets up the environment based on the contents of the `.env` file in your local directory. In the top-level directory of your project, an `.env` file has these contents.

    TIMES=2
    

If you run the app with `heroku local --port 5006` and then open [http://localhost:5006/times](http://localhost:5006/times), you see two numbers generated every time.

To set the config var on Heroku, execute this command.

    $ heroku config:set TIMES=2
    

View the config vars that are set using `heroku config`.

    $ heroku config
    === shrouded-anchorage-35377 Config Vars
    PAPERTRAIL_API_TOKEN: w9EnziexBT2mzMDtS4M
    TIMES:                2
    

Deploy your changed application to Heroku, and then visit it by running `heroku open times`.

Provision a Database
--------------------

Adding a database to complete this tutorial counts towards your usage. To control costs, delete your database as soon as you’re done. Learn about our [low-cost plans](https://blog.heroku.com/new-low-cost-plans). Eligible students can apply for platform credits through our [Heroku for GitHub Students program](https://blog.heroku.com/github-student-developer-program).

The [add-on marketplace](https://elements.heroku.com/addons/categories/data-stores) has a large number of data stores, from Redis and MongoDB providers to Postgres and MySQL. In this step, you add a Heroku Postgres Essential-0 database to your app.

Add the database.

    $ heroku addons:create heroku-postgresql:essential-0
    Creating heroku-postgresql:essential-0 on ⬢ shrouded-anchorage-35377... ~$0.007/hour (max $5/month)
    Database should be available soon
    postgresql-asymmetrical-00466 is being created in the background. The app will restart when complete...
    Use heroku addons:info postgresql-asymmetrical-00466 to check creation progress
    Use heroku addons:docs heroku-postgresql to view documentation
    

This action creates a database and sets a `DATABASE_URL` environment variable that you can check by running `heroku config`.

Use `npm` to add [node-postgres](https://node-postgres.com/) to your dependencies.

    $ npm install pg
    added 14 packages in 2s
    

      "dependencies": {
        "cool-ascii-faces": "^1.3.4",
        "ejs": "^3.1.5",
        "express": "^4.15.2",
        "pg": "^8.11.3"
      },
    

Edit your `index.js` file to use this module to connect to the database specified in your `DATABASE_URL` environment variable. Add this code near the top.

    const { Pool } = require('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
    

Add another route, `/db`, by adding this code just after the existing `app.get('/times', { ... })` route.

    app.get('/db', async (req, res) => {
      console.log(`Rendering the results of a database query for route '/db'`)
      try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM test_table')
        res.render('pages/db', {
          results: result ? result.rows : null
        })
        client.release()
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
    })
    

This action ensures that when you access your app using the `/db` route, it returns all rows in the `test_table` table.

Deploy your code to Heroku. If you access `/db`, you receive an error because there’s no table in the database. Assuming that you have [Postgres installed locally](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup), use the `heroku pg:psql` command to connect to the remote database, create a table, and insert a row.

    $ heroku pg:psql
    --> Connecting to postgresql-asymmetrical-00466
    psql (14.7 (Homebrew))
    SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
    Type "help" for help.
    
    shrouded-anchorage-35377::DATABASE=> create table test_table (id integer, name text);
    CREATE TABLE
    shrouded-anchorage-35377::DATABASE=> insert into test_table values (1, 'hello database');
    INSERT 0 1
    shrouded-anchorage-35377::DATABASE=> \q
    

Now when you access your app’s `/db` route with `heroku open db`, you see something like:

![Database results are 1 hello database](https://devcenter2.assets.heroku.com/article-images/2105-imported-1443570563-2105-imported-1443555039-477-original.jpg)

Read more about [Heroku PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql).

You can use a similar technique to install [MongoDB or Redis add-ons](https://elements.heroku.com/addons/categories/data-stores).

Next Steps
----------

Now you know how to deploy an app, change its configuration, view logs, scale, and attach add-ons. For more information, here’s some recommended reading.

*   For a technical overview of the concepts that you encounter while writing, configuring, deploying, and running applications, read [How Heroku Works](https://devcenter.heroku.com/articles/how-heroku-works).
*   To learn more about developing and deploying Node.js applications, visit the [Node.js category](https://devcenter.heroku.com/categories/nodejs-support).
*   To understand how to take an existing Node.js app and deploy it to Heroku, read [Deploying Node.js Apps on Heroku](https://devcenter.heroku.com/articles/deploying-nodejs).

<div class="title-and-language tutorial-title-and-language"> <header class="dynamic-tutorial-header"> <h1>{{title}}</h1> </header> <nav aria-label="Article languages" class="language-select">English &mdash; <a href="/ja/articles/getting-started-with-nodejs">日本語に切り替える</a></nav> </div> <div class="modal" id="js-report-problem-modal" tabindex="-1" role="dialog" aria-labelledby="report-a-problem" aria-hidden="true"> <div class="modal-dialog"> <div class="modal-content"> <form class="new\_dynamic\_tutorial\_issue" id="new\_dynamic\_tutorial\_issue" action="/dynamic\_tutorial\_issues" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity\_token" value="yBBE49F4\_5bRtTcXA0DBi--QuTgoKUOU2wjryMnfzSvrGgs191A1LKAG5wDgy5AkOZeawL4AdgbOd-GQL4G2nw" autocomplete="off" /> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"> <span aria-hidden="true">&times;</span><span class="sr-only"> Close </span> </button> <h3 class="modal-title" id="report-a-problem">Report a problem</h3> </div> <div class="modal-body"> <p> Please explain what issues you've found and we'll use it to improve this tutorial. </p> <p> Include as much detail as possible, including any error messages and the steps you performed leading up to them. </p> <p> Note: This form is only for feedback on the tutorial. For issues deploying your own code, use <a href="https://help.heroku.com">https://help.heroku.com</a> instead. </p> <textarea class="form-control js-issue-textarea" maxlength="2000" name="dynamic\_tutorial\_issue\[issue\]" id="dynamic\_tutorial\_issue\_issue"> </textarea> <div class="character-count"> <span class="js-character-count">0</span> / 2000 characters </div> <input autocomplete="off" type="hidden" name="dynamic\_tutorial\_issue\[article\_id\]" id="dynamic\_tutorial\_issue\_article\_id" /> <input autocomplete="off" type="hidden" name="dynamic\_tutorial\_issue\[step\_name\]" id="dynamic\_tutorial\_issue\_step\_name" /> <input autocomplete="off" type="hidden" name="dynamic\_tutorial\_issue\[step\_position\]" id="dynamic\_tutorial\_issue\_step\_position" /> </div> <div class="modal-footer"> <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> <input type="submit" name="commit" value="Report problem" class="btn btn-primary" data-disable-with="Report problem" /> </div> </form> </div> </div> </div> <div class="row"> <div class="col-md-4"> <div class="list-group"> {{#each steps}} <a class="dynamic-tutorial-step list-group-item {{ getStatus }} js-step-navigation" href="#{{id}}">{{title}}</a> {{/each}} </div> </div> <div class="main col-md-8 dynamic-tutorial-content content"> <h2>{{currentStep.title}}</h2> {{{currentStep.content}}} {{#unless inLastStep}} <div class="text-center" style="margin-top: 40px;"> <p> {{#if inFirstStep}} <a class="btn btn-lg btn-default" href="{{@article.slug}}?singlepage=true"> View as single page </a> {{else}} {{#if loggedIn }} <a class="btn btn-lg btn-default" href="#" data-toggle="modal" data-target="#js-report-problem-modal"> Report a problem </a> {{else}} <a class="btn btn-lg btn-default" href="/login?back\_to=%2Farticles%2Fgetting-started-with-nodejs%23{{ currentStepId currentStep }}"> Log in to report a problem </a> {{/if}} {{/if}} <a class="btn btn-lg btn-primary js-button js-complete" href="/articles/getting-started-with-nodejs#{{currentStep.nextStepId}}"> {{currentStep.nextMessage}} </a> </p> {{#unless loggedIn }} <p> (<a href="/login?back\_to=%2Farticles%2Fgetting-started-with-nodejs%23{{ currentStepId currentStep }}">Log in</a> to save and track your progress) </p> {{/unless}} </div> {{/unless}} </p> </div> </div>

#### Information & Support

*   [Getting Started](/start)
*   [Documentation](/categories/reference)
*   [Changelog](/changelog)
*   [Compliance Center](https://www.heroku.com/compliance)
*   [Training & Education](https://www.heroku.com/training-and-education)
*   [Blog](https://blog.heroku.com/)
*   [Support Channels](/articles/support-channels)
*   [Status](https://status.heroku.com/)

#### Language Reference

*   [Node.js](/categories/nodejs-support)
*   [Ruby](/categories/ruby-support)
*   [Java](/categories/java-support)
*   [PHP](/categories/php-support)
*   [Python](/categories/python-support)
*   [Go](/categories/go-support)
*   [Scala](/categories/scala-support)
*   [Clojure](/categories/clojure-support)
*   [.NET](/categories/dotnet-support)

#### Other Resources

*   [Careers](https://www.heroku.com/careers)
*   [Elements](https://elements.heroku.com/)
*   [Products](https://www.heroku.com/products)
*   [Pricing](https://www.heroku.com/pricing)

*   [RSS](https://devcenter.heroku.com/articles/feed)
    
    *   [Dev Center Articles](https://devcenter.heroku.com/articles/feed)
    *   [Dev Center Changelog](https://devcenter.heroku.com/changelog/feed)
    *   [Heroku Blog](https://blog.heroku.com/feed)
    *   [Heroku News Blog](https://blog.heroku.com/news/feed)
    *   [Heroku Engineering Blog](https://blog.heroku.com/engineering/feed)
    
*   [Twitter](https://twitter.com/herokudevcenter)
    
    *   [Dev Center Articles](https://twitter.com/herokudevcenter)
    *   [Dev Center Changelog](https://twitter.com/herokuchangelog)
    *   [Heroku](https://twitter.com/heroku)
    *   [Heroku Status](https://twitter.com/herokustatus)
    
*   [Github](https://github.com/heroku)
*   [LinkedIn](https://www.linkedin.com/company/heroku)

*   © 2025 Salesforce, Inc. All rights reserved. Various trademarks held by their respective owners. Salesforce Tower, 415 Mission Street, 3rd Floor, San Francisco, CA 94105, United States
*   [heroku.com](https://www.heroku.com)
*   [Legal](https://www.salesforce.com/company/legal/)
*   [Terms of Service](https://www.salesforce.com/company/legal/sfdc-website-terms-of-service/)
*   [Privacy Information](https://www.salesforce.com/company/privacy/)
*   [Responsible Disclosure](https://www.salesforce.com/company/disclosure/)
*   [Trust](https://trust.salesforce.com/en/)
*   [Contact](https://www.salesforce.com/form/contact/contactme/?d=70130000000EeYa)
*   [Cookie Preferences](#)
*   [Your Privacy Choices](https://www.salesforce.com/form/other/privacy-request/)

(function(w,d,s,l,i){w\[l\]=w\[l\]||\[\];w\[l\].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)\[0\], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-JD26'); $(function() { new DynamicTutorial($('.js-dynamic-tutorial-source'), window.loggedIn(), 2105); });

# Source: https://devcenter.heroku.com/articles/config-vars

*   [Heroku Architecture](/categories/heroku-architecture)
*   [Configuration and Config Vars](/articles/config-vars)

Configuration and Config Vars
=============================

English — [日本語に切り替える](/ja/articles/config-vars)

Last updated July 23, 2025

Table of Contents
-----------------

*   [Managing config vars](#managing-config-vars)
*   [Accessing config var values from code](#accessing-config-var-values-from-code)
*   [Config var scope](#config-var-scope)
*   [Config var policies](#config-var-policies)
*   [Add-ons and config vars](#add-ons-and-config-vars)
*   [Local setup](#local-setup)
*   [Production and development modes](#production-and-development-modes)

A single app always runs in [multiple environments](https://devcenter.heroku.com/articles/multiple-environments), including at least on your development machine and in production on Heroku. An open-source app might be deployed to hundreds of different environments.

Although these environments might all run the same code, they usually have environment-specific _configurations_. For example, an app’s staging and production environments might use different Amazon S3 buckets, meaning they also need different _credentials_ for those buckets.

An app’s environment-specific configuration should be stored in environment variables (not in the app’s source code). This lets you modify each environment’s configuration in isolation, and prevents secure credentials from being stored in version control. [Learn more about storing config in the environment.](https://12factor.net/config)

On a traditional host or when working locally, you often set environment variables in your `.bashrc` file. On Heroku, you use **config vars**.

Managing config vars
--------------------

Whenever you set or remove a config var using any method, your app is restarted and a new [release](https://devcenter.heroku.com/articles/releases) is created.

Config var values are persistent–they remain in place across deploys and app restarts. Unless you need to change a value, you only need to set it once.

### Using the Heroku CLI

The `heroku config` commands of the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) makes it easy to manage your app’s config vars.

#### View current config var values

    $ heroku config
    GITHUB_USERNAME: joesmith
    OTHER_VAR:    production
    
    $ heroku config:get GITHUB_USERNAME
    joesmith
    

#### Set a config var

    $ heroku config:set GITHUB_USERNAME=joesmith
    Adding config vars and restarting myapp... done, v12
    GITHUB_USERNAME: joesmith
    

#### Remove a config var

    $ heroku config:unset GITHUB_USERNAME
    Unsetting GITHUB_USERNAME and restarting myapp... done, v13
    

### Using the Heroku Dashboard

You can also edit config vars from your app’s **`Settings`** tab in the [Heroku Dashboard](https://dashboard.heroku.com/):

![Config Vars in Dashboard](https://devcenter1.assets.heroku.com/article-images/321-imported-1443570183-321-imported-1443554644-389-original.jpg "Config Vars in Dashboard")

### Using the Platform API

You can manage your app’s config vars programmatically with the [Heroku Platform API](https://devcenter.heroku.com/articles/platform-api-reference#config-vars) using a simple HTTPS REST client and JSON data structures. You need a valid Heroku access token representing a user with proper permissions on the app.

Accessing config var values from code
-------------------------------------

Config vars are exposed to your app’s code as environment variables. For example, in Node.js you can access your app’s `DATABASE_URL` config var with `process.env.DATABASE_URL`.

In the Common Runtime, we expand the values of the config vars referenced in your code commands before sending the output to your logs for audit purposes. Avoid using direct references to sensitive environment variables where your app code writes to standard out (stdout) or standard error (stderr).

### Examples

Add some config vars for your S3 account keys:

    $ cd myapp
    $ heroku config:set S3_KEY=8N029N81 S3_SECRET=9s83109d3+583493190
    Setting config vars and restarting myapp... done, v14
    S3_KEY:   8N029N81
    S3_SECRET: 9s83109d3+583493190
    

Set up your code to read the vars at runtime. For example, in Ruby you access the environment variables using the `ENV['KEY']` pattern - so now you can write an initializer like so:

    AWS::S3::Base.establish_connection!(
     :access_key_id   => ENV['S3_KEY'],
     :secret_access_key => ENV['S3_SECRET']
    )
    

In Node.js, use `process.env` to access environment variables:

    const aws = require('aws-sdk');
    
    let s3 = new aws.S3({
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET
    });
    

In Java, you can access it through calls to `System.getenv('key')`, like so:

    S3Handler = new S3Handler(System.getenv("S3_KEY"), System.getenv("S3_SECRET"))
    

In Python, using the [boto library](http://boto.cloudhackers.com/en/latest/s3_tut.html):

    from boto.s3.connection import S3Connection
    s3 = S3Connection(os.environ['S3_KEY'], os.environ['S3_SECRET'])
    

Now, upon deploying to Heroku, the app will use the keys set in the config.

Config var scope
----------------

For apps using [classic buildpacks](https://devcenter.heroku.com/articles/buildpacks#classic-buildpacks), config vars are available at build time and runtime.

For apps using [Cloud Native Buildpacks](https://devcenter.heroku.com/articles/buildpacks#cloud-native-buildpacks), by default, config vars are only accessible at runtime. You can make them available during both build time and runtime by enabling the [Heroku Labs Build Time Config Vars feature](https://devcenter.heroku.com/articles/build-time-config-vars).

Config var policies
-------------------

*   Config var keys should use only alphanumeric characters and the underscore character (`_`), and not begin with a digit, to ensure that they are accessible from all programming languages and shells. Config var keys should _not_ include the hyphen character.
*   Config var data (the combination of all keys and values) cannot exceed 64kb for each app.
*   Config var keys should not begin with a double underscore (`__`).
*   A config var’s key should not begin with `HEROKU_` unless it is set by the Heroku platform itself.

Add-ons and config vars
-----------------------

If you provision an [add-on](https://devcenter.heroku.com/articles/add-ons) for your app, it usually adds one or more config vars to the app. The values of these config vars might be updated by the add-on provider at any time.

See [Add-on values can change](https://devcenter.heroku.com/articles/add-ons#config-var-values-can-change) to learn more about add-ons and how they use config vars.

Local setup
-----------

Use the [Heroku Local](https://devcenter.heroku.com/articles/heroku-local) command-line tool to run your app locally.

Production and development modes
--------------------------------

Many languages and frameworks support a development mode. This typically enables more debugging, as well as dynamic reloading or recompilation of changed source files.

For example, in a Ruby environment, you could set a `RACK_ENV` config var to `development` to enable such a mode.

It’s important to understand and keep track of these config vars on a production Heroku app. While a development mode is typically great for development, it’s not so great for production, because it can degrade performance.

### [Keep reading](#keep-reading)

*   [Heroku Architecture](/categories/heroku-architecture)

### [Feedback](#feedback)

[Log in to submit feedback.](/login?back_to=%2Farticles%2Fconfig-vars&utm_campaign=login&utm_medium=feedback&utm_source=web)

# Source: https://devcenter.heroku.com/articles/deploying-nodejs

*   [Language Support](/categories/language-support)
*   [Node.js](/categories/nodejs-support)
*   [Working with Node.js](/categories/working-with-node-js)
*   [Deploying Node.js Apps on Heroku](/articles/deploying-nodejs)

Deploying Node.js Apps on Heroku
================================

English — [日本語に切り替える](/ja/articles/deploying-nodejs)

Last updated December 04, 2024

Table of Contents
-----------------

*   [Prerequisites](#prerequisites)
*   [Overview](#overview)
*   [Declare App Dependencies](#declare-app-dependencies)
*   [Specify the Node Version](#specify-the-node-version)
*   [Specify a Start Script](#specify-a-start-script)
*   [Build Your App and Run It Locally](#build-your-app-and-run-it-locally)
*   [How to Keep Build Artifacts Out of Git](#how-to-keep-build-artifacts-out-of-git)
*   [Deploy Your Application to Heroku](#deploy-your-application-to-heroku)
*   [Provision a Database](#provision-a-database)
*   [Next Steps](#next-steps)

This article describes how to take an existing Node.js app and deploy it to Heroku.

If you’re new to Heroku, check out [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

Prerequisites
-------------

This article assumes that you have:

*   [Node.js](http://nodejs.org/) and npm installed.
*   An existing Node.js app.
*   A free [Heroku account](https://signup.heroku.com/signup/dc).
*   The [Heroku CLI](https://cli.heroku.com/).

Overview
--------

Heroku Node.js support is only applied when the application has a `package.json` file in the root directory.

See [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support) for more info.

Declare App Dependencies
------------------------

The `package.json` file defines the dependencies to install with your application. To create a `package.json` file for your app, run the `npm init` command in your app’s root directory. It shows you how to create a `package.json` file. You can skip any of the prompts by leaving them blank.

Use the `git bash` application to open a command shell on Windows. The CLI installation added a shortcut for this application to your desktop.

    $ cd node-example
    $ npm init
    ...
    name: (node-example)
    version: (1.0.0)
    description: This example is so cool.
    entry point: (web.js)
    test command:
    git repository:
    keywords: example heroku
    author: jane-doe
    license: (ISC) MIT
    ...
    

The generated `package.json` file looks like:

    {
      "name": "node-example",
      "version": "1.0.0",
      "description": "This example is so cool.",
      "main": "web.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [
        "example",
        "heroku"
      ],
      "author": "jane-doe",
      "license": "MIT"
    }
    

To install dependencies, use `npm install <package>`, which also adds the package as a dependency in the `package.json` file. For example, to install [express](https://npmjs.org/package/express), type `npm install express`.

Make sure that you don’t rely on any system-level packages. Missing dependencies in your `package.json` file cause problems when you try to deploy to Heroku. To troubleshoot this issue, on your local command line, type `rm -rf node_modules; npm install --production`, and then try to run your app locally by typing `heroku local web`. If your `package.json` file is missing a dependency, you see an error that indicates which module can’t be found.

Specify the Node Version
------------------------

Specify the Node.js version used to run your application on Heroku in your `package.json` file. Always specify a Node.js version that matches the runtime that you’re developing and testing with. To find your version, type `node --version`.

Your `package.json` file looks like:

    "engines": {
      "node": "22.x"
    },
    

In the Node.js versioning scheme, odd versions are unstable and even versions are stable. The stable branch takes bug fixes only.

With the dependencies installed and the node version specified, the `package.json` file looks like:

    {
      "name": "node-example",
      "version": "1.0.0",
      "description": "This example is so cool.",
      "main": "web.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [
        "example",
        "heroku"
      ],
      "author": "jane-doe",
      "license": "MIT",
      "dependencies": {
        "express": "^4.9.8"
      },
      "engines": {
        "node": "22.x"
      }
    }
    

It’s a good idea to keep your development environment and production environment as similar as possible. Make sure that your local Node.js version matches the version that you told Heroku to use in the `package.json` file. To check which version you’re running locally, at the command line, type `node --version`.

Specify a Start Script
----------------------

To determine how to start your app, Heroku first looks for a [Procfile](https://devcenter.heroku.com/articles/procfile). If no Procfile exists for a Node.js app, we attempt to start a default `web` process via the [start script](https://docs.npmjs.com/misc/scripts) in your package.json.

The command in a web process type must bind to the port number [specified in the `PORT` environment variable](https://devcenter.heroku.com/articles/dyno-startup-behavior#local-environment-variables). If it doesn’t, the dyno doesn’t start.

For more information, see [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices#hook-things-up) and [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support#default-web-process-type).

Build Your App and Run It Locally
---------------------------------

To install the dependencies that you declared in your `package.json` file, run the `npm install` command in your local app directory.

    $ npm install
    

Start your app locally using the `heroku local` command, which installed as part of the Heroku CLI.

    $ heroku local web --port 5001
    

Your app now runs on [http://localhost:5001/](http://localhost:5001/).

How to Keep Build Artifacts Out of Git
--------------------------------------

We don’t recommend checking `node_modules` into Git because it causes the build cache to not be used. For more information, see [build behavior](https://devcenter.heroku.com/articles/nodejs-support#build-behavior).

Prevent build artifacts from going into revision control by creating a [.gitignore](https://devcenter.heroku.com/articles/gitignore) file that looks like:

    /node_modules
    npm-debug.log
    .DS_Store
    /*.env
    

Deploy Your Application to Heroku
---------------------------------

After you commit your changes to Git, you can deploy your app to Heroku.

    $ git add .
    $ git commit -m "Added a Procfile."
    $ heroku login
    Enter your Heroku credentials.
    ...
    $ heroku create example-app
    Creating example-app... done, stack is cedar
    http://example-app-1234567890ab.herokuapp.com/ | git@heroku.com:arcane-lowlands-8408.git
    Git remote heroku added
    $ git push heroku main
    ...
    -----> Node.js app detected
    ...
    -----> Launching... done
           http://example-app-1234567890ab.herokuapp.com deployed to Heroku
    
    

To open the app in your browser, type `heroku open`.

Provision a Database
--------------------

The [add-on marketplace](https://elements.heroku.com/addons/#data-stores) has a large number of data stores, such as Postgres, Redis, MongoDB, and MySQL.

Next Steps
----------

*   Read [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices).
*   To learn more about developing and deploying Node.js applications, visit the [Node.js category](https://devcenter.heroku.com/categories/nodejs-support).

### [Keep reading](#keep-reading)

*   [Working with Node.js](/categories/working-with-node-js)

### [Feedback](#feedback)

[Log in to submit feedback.](/login?back_to=%2Farticles%2Fdeploying-nodejs&utm_campaign=login&utm_medium=feedback&utm_source=web)