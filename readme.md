# vue-nested-tree

## About

### Installation

To use the nested tree interface include `NestedTree.vue` in your JavaScript and `nested-tree.scss` in your styles.

### Dependencies

This interface makes use of the following external dependencies:

* Bulma `0.8.0`
* Font Awesome Core `1.2.26`
* Fort Awesome Free `5.12.0`
* Vue `2.6.10`
* Vue Font-Awesome `0.1.9`

## Components

This interface includes four components, which are detailed below:

* Nested Tree
* Tree Row
* Tree Line
* Toggle Button

In normal use the only component you will need to include and access directly is Nested Tree.

### Nested Tree

#### Usage

Place a `<nested-tree>` tag on your page along with the required props to use the component.

This component has a `<table>` element at its base, wrapped in a Bulma `table-container` to handle overflow.

It is recommended to place the Nested Tree with minimal content to the left or right, as nested data can become quite wide when fully expanded.

#### Slots

| Name         | Wrapper        | Location                              |
| ------------ | -------------- | ------------------------------------- |
| header-left  | div.level-item | Top left, above table                 |
| header-right | div.level-item | Top right, above table, after toggles |

#### Props

| Name              | Type    | Required | Default | Sync | Validation      |
| ----------------- | ------- | -------- | ------- | ---- | --------------- |
| columns           | Array   | Yes      |         | No   | objectsHaveKeys |
| percentage_of     | String  | No       | null    | No   |                 |
| start_group       | Boolean | No       | false   | No   |                 |
| start_percented   | Boolean | No       | false   | No   |                 |
| subtree_url       | String  | No       | false   | No   | isNotBlank      |
| title             | String  | Yes      |         | No   | isNotBlank      |
| traverse_down_url | String  | No       | false   | No   | isNotBlank      |
| traverse_up_url   | String  | No       | false   | No   |                 |
| tree              | Array   | Yes      |         | No   |                 |

##### columns

An array of objects is used to display fields held within the `data` prop while the data is ungrouped.

```
{
    columns: [
        {
            name: "Column Title",
            icon: "times-square",
            field: "data_field",
            percent: false
        }
    ]
}
``` 

| Key     | Type    | Required | Default | Description                                                   |
| ------- | ------- | -------- | ------- | ------------------------------------------------------------- |
| name    | String  | Yes      |         | The label to show when hovering over the icon                 |
| icon    | String  | Yes      |         | The font-awesome icon to display in the header                |
| field   | String  | No       | *name*  | The matching `data` field; equal to lowercase `name` if blank |
| percent | Boolean | No       | true    | Whether the column should be shown as a percent, if enabled   |

##### groups

An array of objects used to determine how to combine `data` fields, and how to display them on the table when grouping is enabled.

If left blank, the groups button will be hidden.

| Key     | Type    | Required | Default | Description                                                 |
| ------- | ------- | -------- | ------- | ----------------------------------------------------------- |
| name    | String  | Yes      |         | The label to show when hovering over the icon               |
| icon    | String  | Yes      |         | The font-awesome icon to display in the header              |
| field   | String  | Yes      |         | The data property to be used for the calculated group       |
| fields  | Array   | Yes      |         | The matching `data` fields to be added together             |
| percent | Boolean | No       | true    | Whether the column should be shown as a percent, if enabled |

```
groups: [
    {
        name: 'Confirmed',
        icon: 'check',
        field: 'confirmed',
        fields: [ "confirmed", "unavailable" ],
        percent: false
    }
]
```

##### percentage_of

To enable the percentage toggle button, provide the `data` field to be used for all calculations.

Any column or group using the `data` field will automatically be set to `percent: false`.

If left blank percentages will be disabled and the toggle button will be hidden.

`percentage_of: "data_field"`

##### start_grouped

Whether to initially display the tree using groups.

`start_grouped: true`

##### start_percented

Whether to initially display the tree using percentages.

`start_percent: true`

##### subtree_url

An endpoint where subtree data for a given ID can be loaded.

The response from the server should contain a "branch" object (see the `tree` prop) with at most one level of children.

If left blank the subtree buttons will be hidden.

##### title

The overarching description for the presented tree that will be shown in the table header, spanning the tree.

`title: "Family Member"`

##### traverse_downward_url

An endpoint where data from below the current node's level can be loaded.

The request will include the ID of the node to use as a reference.

If left blank the "expand" button will be hidden on nodes without any children.

##### traverse_upward_url

An endpoint where data from above the current tree's level can be loaded.

The response from the server should contain an array of tree objects, where one of the immediate children matches the existing root nodes.

If left blank upward traversal will be disabled, and the button will be hidden.

`traverse_upward_url: "my-endpoint/load-up"`

##### tree

This prop contains an array of nested "branch" objects used to display the Nested Tree.

Once provided, the information is processed into two internal trees: `data_tree` and `display_tree`.

* `data_tree` is a copy of the `tree` prop with additional fields added for visibility, pre-processed groups and percentages, and sub-data storage
* `display_tree` contains the table rows that are currently visible within the table, extracted from the `data_tree`

The state of the tree is held internally in the `data_tree`. Actions, such as expanding levels or loading sub-data, change `data_tree` but do not alter the raw `tree`.

If upward traversal is enabled, Nested Tree will attempt to maintain the state of `data_tree`, however if it cannot match the root nodes with the upward data set it may revert to a new state based on the loaded data.

```
tree: [
    {
        id: 1,
        details: [ "Joe Red", "Job Title", "Organisation Unit" ],
        data: { recipients: 20, confirmed: 10, unavailable: 2, viewed: 4, unseen: 2, flagged: 1 },
        children: []
    }
]
```

| Key      | Type            | Required | Default | Description                                                      |
| -------- | --------------- | -------- | ------- | ---------------------------------------------------------------- |
| id       | String, Integer | Yes      |         | A unique ID within the tree level                                |
| details  | String, Array   | Yes      |         | The first value will be bolded, subsequent items will be smaller |
| data     | Object          | Yes      |         | The data fields for the row                                      |
| children | Array           | No       | []      | A nested array of "branch" objects                               |

### Tree Line

To create sharp lines that can adjust its crossbars based on the height of each table row, TreeLine uses DIVs positioned within a cell.

#### Usage

Replace a `<td>` element with a `<tree-line>` component, and pass one of the following values to the `direction` prop:

* cap-up
* cap-down
* cap-left
* cap-right
* cross
* elbow-up-left
* elbow-up-right
* elbow-down-left
* elbow-down-right
* straight-vertical
* straight-horizontal
* tee-up
* tee-down
* tee-left
* tee-right

#### Props

| Name      | Type   | Required | Default | Sync | Validation          |
| --------- | ------ | -------- | ------- | ---- | ------------------- |
| direction | String | Yes      |         | No   | InArray *See usage* |

### Toggle Button

#### Props

| Name      | Type    | Required | Default | Sync | Validation          |
| --------- | ------- | -------- | ------- | ---- | ------------------- |
| checked   | Boolean | No       | False   | Yes  |                     |
| label     | String  | No       | ""      | No   |                     |
| label_on  | String  | No       | ""      | No   |                     |
| label_off | String  | No       | ""      | No   |                     |
