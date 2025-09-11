# Customizable widget container

This client extension provides a React component aimed at making it
possible for a end user to choose the widgets he wants to display
in a grid.

The page creator adds the fragment containing the component to a
page, he specifies how many slots to display (the number of items)
and the number of widgets available to be displayed.

Then, he drops the available widgets to those slots and defines
a title for each of them.

Now, a user can build his own grid of widgets using the ones
available.

What I'm calling widget here is anything you can put in a dropzone.
It can be fragments, portlets...

# Setting it up

## Object Definition

There's an object definition under `object-definition` to be
deployed. It contains the persistence.

It's site scoped and contains a `plid` (id of the page) and
a `configuration`.

The `creatorId` (native metadata associated to any object)
of the object will define whose user this configuration belongs to.

## Fragment

You need to build the fragment using the files defined
in the `fragments` folder.

## Deploy the client extension

`blade gw clean deploy` deploys the component.