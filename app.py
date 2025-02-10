import os
import json
import subprocess
import requests
import re
import shutil

# Constants
CREDENTIALS_FILE = os.path.expanduser("~/.git_credentials.json")
GITHUB_API = "https://api.github.com"

# ======= Authentication System =======
def load_credentials():
    """Load saved GitHub credentials."""
    if os.path.exists(CREDENTIALS_FILE):
        with open(CREDENTIALS_FILE, "r") as file:
            return json.load(file)
    return {}

def save_credentials(username, token):
    """Save GitHub credentials securely."""
    credentials = {"username": username, "token": token}
    with open(CREDENTIALS_FILE, "w") as file:
        json.dump(credentials, file)
    print("✅ GitHub credentials saved!")

def git_login():
    """Login using GitHub username & token."""
    credentials = load_credentials()
    if credentials:
        print(f"✅ Already logged in as {credentials['username']}")
        return credentials

    username = input("Enter GitHub username: ")
    token = input("Enter GitHub Personal Access Token (PAT): ")

    save_credentials(username, token)
    return {"username": username, "token": token}

# ======= Git Operations =======
def execute_command(command):
    """Execute shell commands with error handling."""
    try:
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error executing command: {e}")

def repo_exists(repo_name):
    """Check if repo exists on GitHub and if the folder exists locally."""
    credentials = git_login()
    folder_exists = os.path.exists(repo_name)

    url = f"{GITHUB_API}/repos/{credentials['username']}/{repo_name}"
    headers = {"Authorization": f"token {credentials['token']}"}
    response = requests.get(url, headers=headers)

    remote_exists = response.status_code == 200

    return remote_exists, folder_exists

def create_repo(repo_name, private=True):
    """Create a new GitHub repository."""
    # Validate repository name
    if not re.match(r'^[a-zA-Z0-9_.-]+$', repo_name):
        print("❌ Repository name contains invalid characters. Use letters, numbers, ., -, or _.")
        return
    if repo_name.startswith('-'):
        print("❌ Repository name cannot start with a hyphen.")
        return
    if len(repo_name) > 100:
        print("❌ Repository name is too long (max 100 characters).")
        return

    remote_exists, folder_exists = repo_exists(repo_name)
    if remote_exists:
        print(f"❌ GitHub repository '{repo_name}' already exists!")
        return
    if folder_exists:
        print(f"⚠️ Folder '{repo_name}' already exists locally.")
        proceed = input("Create remote repository anyway? (yes/no): ").lower()
        if proceed != 'yes':
            print("❌ Repository creation aborted!")
            return

    credentials = git_login()
    url = f"{GITHUB_API}/user/repos"
    headers = {"Authorization": f"token {credentials['token']}"}
    data = {"name": repo_name, "private": private}

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 201:
        print(f"✅ Repository '{repo_name}' created successfully!")
        if not os.path.exists(repo_name):
            auto_clone(repo_name)
        else:
            print(f"⚠️ Local folder exists. To link, run:")
            print(f"cd {repo_name}")
            print(f"git remote add origin https://github.com/{credentials['username']}/{repo_name}.git")
            print(f"git push -u origin master")
    else:
        print(f"❌ Error creating repository: {response.status_code} {response.text}")

def auto_clone(repo_name):
    """Automatically clone and enter the repo."""
    credentials = git_login()
    repo_url = f"https://github.com/{credentials['username']}/{repo_name}.git"

    print(f"📥 Cloning {repo_name}...")
    execute_command(["git", "clone", repo_url])

    if os.path.exists(repo_name):
        os.chdir(repo_name)
        print(f"📂 Entered into '{repo_name}'")
        print("👋 Exiting script...")
        exit()
    else:
        print("❌ Clone failed!")

def delete_repo(repo_name):
    """Delete repository from GitHub & local system."""
    if not repo_name:
        print("❌ Repository name cannot be empty.")
        return
    if '/' in repo_name or '\\' in repo_name or repo_name in ('.', '..'):
        print("❌ Invalid repository name.")
        return

    credentials = git_login()
    url = f"{GITHUB_API}/repos/{credentials['username']}/{repo_name}"
    headers = {"Authorization": f"token {credentials['token']}"}

    response = requests.delete(url, headers=headers)

    if response.status_code == 204:
        print(f"✅ Repository '{repo_name}' deleted successfully!")
        if os.path.exists(repo_name):
            try:
                if os.path.isdir(repo_name):
                    shutil.rmtree(repo_name)
                    print(f"🗑️ Local folder '{repo_name}' deleted!")
                else:
                    print(f"⚠️ '{repo_name}' is not a directory. Skipping local deletion.")
            except Exception as e:
                print(f"❌ Error deleting local folder: {e}")
    else:
        print(f"❌ Error deleting repository: {response.status_code} {response.text}")

def set_repo_visibility(repo_name, private):
    """Set repository visibility (private/public)."""
    credentials = git_login()
    url = f"{GITHUB_API}/repos/{credentials['username']}/{repo_name}"
    headers = {"Authorization": f"token {credentials['token']}"}
    data = {"private": private}

    response = requests.patch(url, json=data, headers=headers)

    if response.status_code == 200:
        status = "Private" if private else "Public"
        print(f"✅ Repository '{repo_name}' is now {status}!")
    else:
        print(f"❌ Error: {response.status_code} {response.text}")

def push_repo():
    """Push latest changes to GitHub."""
    if not os.path.exists(".git"):
        print("❌ This is not a Git repository!")
        return

    try:
        # Check for changes
        subprocess.run(["git", "diff", "--quiet"], check=True)
        subprocess.run(["git", "diff", "--cached", "--quiet"], check=True)
        print("⏩ No changes to commit.")
        return
    except subprocess.CalledProcessError:
        pass  # Proceed if there are changes

    execute_command(["git", "add", "."])
    try:
        execute_command(["git", "commit", "-m", "Auto commit"])
    except subprocess.CalledProcessError:
        print("❌ Commit failed (no changes or other error).")
        return
    execute_command(["git", "push"])

def clone_public_repo():
    """Clone any public GitHub repository."""
    repo_url = input("Enter public Git repository URL: ").strip()
    
    if not repo_url:
        print("❌ Invalid URL!")
        return

    print(f"📥 Cloning {repo_url}...")
    execute_command(["git", "clone", repo_url])

    repo_name = repo_url.split("/")[-1].replace(".git", "")

    if os.path.exists(repo_name):
        os.chdir(repo_name)
        print(f"📂 Entered into '{repo_name}'")
        print("👋 Exiting script...")
        exit()
    else:
        print("❌ Clone failed!")

# ======= Main Menu =======
def main():
    """User command menu."""
    inside_git_repo = os.path.exists(".git")

    while True:
        print("\n📌 Choose an option:")
        
        if not inside_git_repo:
            print(" 1️⃣  Create Repository")
            print(" 5️⃣  Clone Public Repository")
        
        print(" 2️⃣  Delete Repository")
        print(" 3️⃣  Make Repository Private/Public")
        print(" 4️⃣  Push to Repository")
        print(" 6️⃣  Exit")

        choice = input("Enter choice: ")

        if choice == "1" and not inside_git_repo:
            repo_name = input("Enter repository name: ")
            private = input("Private repo? (yes/no): ").strip().lower() == "yes"
            create_repo(repo_name, private)

        elif choice == "2":
            repo_name = input("Enter repository name to delete: ")
            delete_repo(repo_name)

        elif choice == "3":
            repo_name = input("Enter repository name: ")
            private = input("Make Private? (yes/no): ").strip().lower() == "yes"
            set_repo_visibility(repo_name, private)

        elif choice == "4":
            push_repo()

        elif choice == "5" and not inside_git_repo:
            clone_public_repo()

        elif choice == "6":
            print("👋 Exiting...!")
            break

        else:
            print("❌ Invalid or hidden option!")

if __name__ == "__main__":
    main()
