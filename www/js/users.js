load('dom')

// Using window.onload because an onclick="..." handler doesn't give the
// handler a this-variable
var old_load = window.onload;
window.onload = function() {
	if (old_load) old_load();
	$('password_button').parentNode.onsubmit = verifyPassword;
	$('email').focus();

	// Initialize the select-dropdown
	selectInit();
}

function sendEmail() {
	AjaxSyncPostLog(document.location, "email=" + $('email').value);
}

// global variable to temporarily store the password to be verified
var enteredPassword;
function verifyPassword() {
	var input = $('password')
	enteredPassword = input.value;
	if (!enteredPassword) {
		Log('Please enter a password before pressing "change"', false);
		return false;
	}

	// Some cleaning up.
	input.value = '';
	this.firstChild.innerHTML = 'Verify';
	// change te onclick handler
	input.focus();
	$('password_button').parentNode.onsubmit = checkPasswords;
	Log('Please verify your password', true);
	return false;
}

function checkPasswords() {
	// Again some cleaning up.
	this.firstChild.innerHTML = 'Password';
	// Make sure the change-button isn't highlighted anymore
	this.blur();
	// change the onclick handler back to the verifyPassword function
	$('password_button').parentNode.onsubmit = verifyPassword;

	// Do the check after cleaning up.
	if ($('password').value != enteredPassword) {
		Log('Verification of password failed', false);
		enteredPassword = '';
		$('password').value = '';
		return false;
	}

	$('password').value = '';

	// Send the entered password to the server.
	sendPassword(enteredPassword);
	enteredPassword = '';
	return false;
}

function sendPassword(password) {
	AjaxSyncPostLog(document.location, "password=" + password)
}


/*
 * Adding users to groups and removing them from groups
 */
function addMemberToGroupAjax(group) {
	return AjaxSyncPostLog(document.location, "addToGroup=" + group);
}

function removeMemberFromGroupAjax(group) {
	return AjaxSyncPostLog(document.location, "removeFromGroup=" + group);
}

var selectli = null;
function remove() {
	var li = this.parentNode;
	var groupname = li.id.replace('group.', '');

	// Do the serverside thing!
	var success = removeMemberFromGroupAjax(groupname);

	if (!success)
		return false;

	this.parentNode.parentNode.removeChild(this.parentNode);
	var option = document.createElement('option');
	option.appendChild(document.createTextNode(groupname));
	selectli.firstChild.appendChild(option);
	if (selectli.firstChild.disabled)
		selectli.firstChild.disabled = false;

	// Prevent following the link
	return false;
}

function add() {
	// First create the nodes
	var select = this.parentNode.firstChild;
	var groupname = select.options[select.selectedIndex].innerHTML;

	if (groupname == "---") {
		Log('Please select a group first', false)
		return false;
	}

	// Do the serverside thing!
	var success = addMemberToGroupAjax(groupname);

	if (!success)
		return false;

	var li = document.createElement('li');
	li.id = 'group.' + groupname;
	var link = document.createElement('a');
	link.appendChild(document.createTextNode(groupname));
	link.href = media_url + '/groups/show/' + groupname;
	li.appendChild(link);
	var remover = document.createElement('a');
	remover.className = 'remover';
	remover.onclick = remove;
	remover.href = '#';
	var img = document.createElement('img');
	img.className = "remover";
	img.src = media_url + '/img/min.gif';
	remover.appendChild(document.createTextNode(' '));
	remover.appendChild(img);
	li.appendChild(remover);
	document.getElementById('memberof').insertBefore(li, this.parentNode);

	// Remove the user from the select
	var select = this.parentNode.firstChild;
	select.removeChild(select.options[select.selectedIndex]);
	if (select.options.length == 1)
		select.disabled = true;

	// Prevent following the link
	return false;
}

function selectInit() {
	var groups = document.getElementById('memberof');
	var links = groups.getElementsByTagName('a');
	selectli = document.getElementById('add');

	// user might be a non-admin, then no selectli exists
	if (!selectli)
		return;

	var map = {'adder': add, 'remover': remove};
	for (var linkidx = 0; linkidx < links.length; ++linkidx) {
		var link = links[linkidx];
		if (!link.className)
			continue;
		link.onclick = map[link.className];
	}

	var select = selectli.firstChild;
	if (select.options.length == 1)
		select.disabled = true;
}

