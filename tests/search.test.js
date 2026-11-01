import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, parseSearch, searchRecords, searchUrl } from '../src/utils/search.js';
import { initialPosts } from '../src/data/homeData.js';
import { communityProjects } from '../src/data/projectsData.js';
import { peerDirectory, changeRelationship } from '../src/data/peersData.js';
import { seedRooms } from '../src/data/roomsData.js';
import { setRoomJoined } from '../src/utils/community.js';

const state = (query = '') => parseSearch(new URLSearchParams(query));
const index = buildSearchIndex({ posts: initialPosts, projects: communityProjects, peers: peerDirectory, roomsByProject: Object.fromEntries(communityProjects.map((project) => [project.id, seedRooms(project)])), conversations: { private: { text: 'Never index this secret' } } });

test('global search finds public content across types and excludes private messages', () => {
    const result = searchRecords(index.records, state('q=React'));
    assert.ok(result.counts.projects > 0);
    assert.ok(result.counts.peers > 0);
    assert.ok(result.counts.rooms > 0);
    assert.ok(result.counts.tags > 0);
    assert.equal(searchRecords(index.records, state('q=Never+index+this+secret')).total, 0);
    assert.equal(searchRecords(index.records, state('q=%23C%2B%2B&type=peers')).total, 1);
    const sara = searchRecords(index.records, state('q=%40SARA&type=peers'));
    assert.equal(sara.items[0].owner, 'sara');
});

test('filters combine, sorting is deterministic, and pagination clamps safely', () => {
    const filtered = searchRecords(index.records, state('q=React&type=projects&tag=React'));
    assert.equal(filtered.total, 2);
    const ascending = searchRecords(index.records, state('type=projects&sort=name-asc'));
    const descending = searchRecords(index.records, state('type=projects&sort=name-desc'));
    assert.deepEqual(descending.items.map((item) => item.title), ascending.items.map((item) => item.title).reverse());
    const before = JSON.stringify(index.records);
    const first = searchRecords(index.records, state());
    const second = searchRecords(index.records, state('page=2'));
    assert.ok(first.totalPages > 1);
    assert.ok(first.items.every((item) => !second.items.some((other) => item.id === other.id)));
    const final = searchRecords(index.records, state('page=999999'));
    assert.equal(final.page, final.totalPages);
    assert.equal(JSON.stringify(index.records), before);
});

test('search URLs preserve special characters and reject invalid options', () => {
    const original = { q: '#C++ @sara', type: 'projects', tag: 'C++', sort: 'name-desc', page: 2 };
    assert.deepEqual(parseSearch(new URL(searchUrl(original), 'http://suf.local').searchParams), original);
    assert.equal(state('page=-1&type=private&sort=random').page, 1);
    assert.equal(state('page=-1&type=private&sort=random').type, 'all');
});

test('room creators remain members and connected peers can be removed', () => {
    const room = { owner: 'you', joined: true, members: ['you', 'sara'] };
    assert.equal(setRoomJoined(room, false), room);
    assert.equal(changeRelationship({ sara: 'connected' }, 'sara', 'remove').sara, 'none');
});
